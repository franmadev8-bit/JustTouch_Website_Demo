import { FC, useEffect, useRef, useState } from 'react';
import { Input, Modal, message } from 'antd';
import {
    FaInstagram, FaFacebook, FaWhatsapp,
    FaClock, FaMapMarkerAlt, FaUtensils,
    FaPlus, FaMinus, FaShoppingBag, FaTrash, FaPen, FaCheck,
} from 'react-icons/fa';
import { db } from '@/Database/Database';
import { Category } from '@/Models/Category';
import { Product } from '@/Models/Product';
import { Branch } from '@/Models/Branch';
import { Order } from '@/Models/Order';
import { OrderDetail } from '@/Models/OrderDetail';
import { OrderGroup } from '@/Models/OrderGroup';
import './PublicMenu.scss';

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface CartDetail {
    productCode: string;
    productName: string;
    price: number;
    quantity: number;
}

interface CartOrder {
    orderCode: string;
    description: string;
    details: CartDetail[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const calcOrderTotal = (o: CartOrder) =>
    o.details.reduce((s, d) => s + d.price * d.quantity, 0);

const calcCartTotal = (orders: CartOrder[]) =>
    orders.reduce((s, o) => s + calcOrderTotal(o), 0);

// Cuenta items únicos (distintos productos, sin sumar cantidades)
const calcCartUniqueItems = (orders: CartOrder[]) =>
    orders.reduce((s, o) => s + o.details.length, 0);

const newOrderCode = () => `ORD-${Date.now()}`;

// ─── Componente principal ─────────────────────────────────────────────────────

export const PublicMenu: FC = () => {
    const [branch, setBranch] = useState<Branch | null>(null);
    const [franchiseName, setFranchiseName] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [cart, setCart] = useState<CartOrder[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productQty, setProductQty] = useState(1);
    const [productNote, setProductNote] = useState('');
    const [cartOpen, setCartOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<string | null>(null);
    const [editingNote, setEditingNote] = useState('');
    const [phone, setPhone] = useState('');
    const [delivery, setDelivery] = useState('');
    const [confirming, setConfirming] = useState(false);

    // Refs para hacer scroll a cada sección
    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [activeNav, setActiveNav] = useState<string>('');

    // ── Carga de datos ────────────────────────────────────────────────────────

    useEffect(() => {
        const load = async () => {
            try {
                const authData = await db.authData.get(1);
                const branchCode = authData?.BranchCode;
                const user = await db.user.toCollection().first();

                let foundBranch: Branch | null = null;
                let foundName = '';
                if (user?.franchises) {
                    for (const fr of user.franchises) {
                        const b = fr.branches.find(b => b.branchCode === branchCode);
                        if (b) { foundBranch = b; foundName = fr.fantasyName; break; }
                    }
                }
                setBranch(foundBranch);
                setFranchiseName(foundName);

                const cats = await db.category.toArray();
                const withProds = await Promise.all(
                    cats.map(async cat => {
                        const prods = await db.products
                            .where('productCode').startsWith(cat.categoryCode)
                            .toArray();
                        return { ...cat, products: prods };
                    })
                );
                const filtered = withProds.filter(c => c.products.length > 0);
                setCategories(filtered);
                if (filtered.length > 0) setActiveNav(filtered[0].categoryCode);
            } catch {
                message.error('Error al cargar el menú.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Observar qué sección está visible para resaltar el nav
    useEffect(() => {
        if (categories.length === 0) return;
        const observer = new IntersectionObserver(
            entries => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveNav(entry.target.id);
                    }
                }
            },
            { rootMargin: '-30% 0px -60% 0px' }
        );
        categories.forEach(cat => {
            const el = sectionRefs.current[cat.categoryCode];
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [categories]);

    const scrollToSection = (code: string) => {
        sectionRefs.current[code]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // ── Acciones del carrito ──────────────────────────────────────────────────

    const openProduct = (prod: Product) => {
        if (!prod.isAvailable) return;
        setSelectedProduct(prod);
        setProductQty(1);
        setProductNote('');
    };

    const addToNewOrder = () => {
        if (!selectedProduct) return;
        const order: CartOrder = {
            orderCode: newOrderCode(),
            description: productNote,
            details: [{
                productCode: selectedProduct.productCode,
                productName: selectedProduct.name,
                price: parseFloat(selectedProduct.price) || 0,
                quantity: productQty,
            }],
        };
        setCart(prev => [...prev, order]);
        setSelectedProduct(null);
        message.success(`${selectedProduct.name} agregado como nueva orden.`);
    };

    const addToLastOrder = () => {
        if (!selectedProduct) return;
        if (cart.length === 0) { addToNewOrder(); return; }

        const detail: CartDetail = {
            productCode: selectedProduct.productCode,
            productName: selectedProduct.name,
            price: parseFloat(selectedProduct.price) || 0,
            quantity: productQty,
        };

        setCart(prev => {
            const next = [...prev];
            const last = { ...next[next.length - 1] };
            const idx = last.details.findIndex(d => d.productCode === detail.productCode);
            if (idx >= 0) {
                last.details = last.details.map((d, i) =>
                    i === idx ? { ...d, quantity: d.quantity + detail.quantity } : d
                );
            } else {
                last.details = [...last.details, detail];
            }
            next[next.length - 1] = last;
            return next;
        });

        setSelectedProduct(null);
        message.success(`${selectedProduct.name} agregado a la orden actual.`);
    };

    const removeOrder = (code: string) =>
        setCart(prev => prev.filter(o => o.orderCode !== code));

    const changeQty = (orderCode: string, productCode: string, delta: number) => {
        setCart(prev => prev.map(o => {
            if (o.orderCode !== orderCode) return o;
            const details = o.details
                .map(d => d.productCode === productCode ? { ...d, quantity: d.quantity + delta } : d)
                .filter(d => d.quantity > 0);
            return { ...o, details };
        }).filter(o => o.details.length > 0));
    };

    const saveNote = (orderCode: string) => {
        setCart(prev => prev.map(o =>
            o.orderCode === orderCode ? { ...o, description: editingNote } : o
        ));
        setEditingOrder(null);
    };

    // ── Confirmar pedido ──────────────────────────────────────────────────────

    const confirmOrder = async () => {
        if (!phone.trim() || !delivery.trim()) {
            message.warning('Completá el teléfono y la dirección de entrega.');
            return;
        }
        if (cart.length === 0) { message.warning('El carrito está vacío.'); return; }

        setConfirming(true);
        try {
            const subtotal = calcCartTotal(cart);
            const orders: Order[] = cart.map(o => new Order({
                orderCode: o.orderCode,
                description: o.description,
                orderDetails: o.details.map((d, i) => new OrderDetail({
                    detailCode: `${o.orderCode}-${i}`,
                    productName: d.productName,
                    quantity: d.quantity,
                })),
            }));

            await db.orderGroups.add({
                groupCode: `GRP-${Date.now()}`,
                state: 1,
                delivery: delivery.trim(),
                phone: phone.trim(),
                subtotal,
                total: subtotal,
                orders,
            } as OrderGroup);

            message.success('¡Pedido enviado! Pronto lo estaremos preparando.');
            setCart([]); setCartOpen(false); setPhone(''); setDelivery('');
        } catch (e) {
            console.error(e);
            message.error('Error al confirmar el pedido.');
        } finally {
            setConfirming(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 40 }}>🍽️</div>
                <p style={{ color: '#B08A6E', fontFamily: 'Georgia, serif' }}>Cargando menú…</p>
            </div>
        );
    }

    const uniqueCount = calcCartUniqueItems(cart);
    const cartTotal = calcCartTotal(cart);
    const productTotal = parseFloat(selectedProduct?.price || '0') * productQty;

    return (
        <div className="public-menu">

            {/* Hero */}
            <HeroSection branch={branch} franchiseName={franchiseName} />

            {/* Info bar */}
            <InfoBar branch={branch} />

            {/* Nav sticky de categorías */}
            {categories.length > 1 && (
                <nav className="pm-cat-nav">
                    {categories.map(cat => (
                        <button
                            key={cat.categoryCode}
                            className={`pm-cat-nav__btn${activeNav === cat.categoryCode ? ' active' : ''}`}
                            onClick={() => scrollToSection(cat.categoryCode)}
                        >
                            {cat.category}
                        </button>
                    ))}
                </nav>
            )}

            {/* Pills circulares de categorías */}
            {categories.length > 0 && (
                <div className="pm-cat-pills">
                    {categories.map(cat => (
                        <button
                            key={cat.categoryCode}
                            className={`pm-cat-pill${activeNav === cat.categoryCode ? ' active' : ''}`}
                            onClick={() => scrollToSection(cat.categoryCode)}
                        >
                            <div className="pm-cat-pill__circle">
                                {cat.products[0]?.pictureUrl
                                    ? <img src={cat.products[0].pictureUrl} alt={cat.category} />
                                    : <span className="pm-cat-pill__icon">🍽️</span>
                                }
                            </div>
                            <span className="pm-cat-pill__label">{cat.category}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Sin productos */}
            {categories.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#B08A6E' }}>
                    <div style={{ fontSize: 48 }}>🍽️</div>
                    <p style={{ marginTop: 12 }}>Este menú aún no tiene productos.</p>
                </div>
            )}

            {/* Secciones tipo carta */}
            {categories.map(cat => (
                <div
                    key={cat.categoryCode}
                    id={cat.categoryCode}
                    ref={el => { sectionRefs.current[cat.categoryCode] = el; }}
                    className="pm-section"
                >
                    <div className="pm-section__header">
                        <p className="pm-section__title">{cat.category}</p>
                    </div>
                    <div className="pm-grid">
                        {cat.products.map(prod => (
                            <MenuRow key={prod.productCode} product={prod} onClick={() => openProduct(prod)} />
                        ))}
                    </div>
                </div>
            ))}

            {/* Barra flotante */}
            {uniqueCount > 0 && (
                <div className="pm-cart-bar" onClick={() => setCartOpen(true)}>
                    <div className="pm-cart-bar__left">
                        <div className="pm-cart-bar__badge">{uniqueCount}</div>
                        <span className="pm-cart-bar__label">Ver pedido</span>
                    </div>
                    <span className="pm-cart-bar__total">$ {cartTotal.toFixed(2)}</span>
                </div>
            )}

            {/* Modal: detalle de producto */}
            <Modal
                open={!!selectedProduct}
                onCancel={() => setSelectedProduct(null)}
                footer={null}
                title={null}
                centered
            >
                {selectedProduct && (
                    <div>
                        <div className="pm-prod-modal__img-wrap">
                            {selectedProduct.pictureUrl
                                ? <img src={selectedProduct.pictureUrl} alt={selectedProduct.name} className="pm-prod-modal__img" />
                                : <div className="pm-prod-modal__img-placeholder">🍽️</div>
                            }
                        </div>
                        <p className="pm-prod-modal__name">{selectedProduct.name}</p>
                        {selectedProduct.description && (
                            <p className="pm-prod-modal__desc">{selectedProduct.description}</p>
                        )}
                        <p className="pm-prod-modal__price">$ {selectedProduct.price}</p>

                        <div className="pm-prod-modal__qty">
                            <button className="qty-btn" onClick={() => setProductQty(q => Math.max(1, q - 1))}>
                                <FaMinus />
                            </button>
                            <span className="qty-num">{productQty}</span>
                            <button className="qty-btn" onClick={() => setProductQty(q => q + 1)}>
                                <FaPlus />
                            </button>
                        </div>

                        <Input.TextArea
                            className="pm-prod-modal__note"
                            placeholder="Nota (ej: sin cebolla, punto medio…)"
                            value={productNote}
                            onChange={e => setProductNote(e.target.value)}
                            rows={2}
                            style={{ resize: 'none', fontFamily: 'sans-serif' }}
                        />

                        <button className="pm-prod-modal__btn pm-prod-modal__btn--primary" onClick={addToNewOrder}>
                            Agregar a nueva orden — $ {productTotal.toFixed(2)}
                        </button>
                        {cart.length > 0 && (
                            <button className="pm-prod-modal__btn pm-prod-modal__btn--secondary" onClick={addToLastOrder}>
                                Agregar a la orden actual
                            </button>
                        )}
                    </div>
                )}
            </Modal>

            {/* Modal: carrito */}
            <Modal
                open={cartOpen}
                onCancel={() => setCartOpen(false)}
                footer={null}
                title={
                    <span style={{ fontFamily: 'Georgia,serif', fontSize: 17, color: '#2E1C0E' }}>
                        <FaShoppingBag style={{ marginRight: 8, color: '#D4873A' }} />
                        Tu pedido
                    </span>
                }
                centered
                width={520}
            >
                <div className="pm-cart">
                    {cart.length === 0 ? (
                        <div className="pm-cart__empty">🛒 El carrito está vacío</div>
                    ) : (
                        <>
                            {cart.map(order => (
                                <div key={order.orderCode} className="pm-cart__order-item">
                                    <div className="pm-cart__order-header">
                                        {editingOrder === order.orderCode ? (
                                            <Input
                                                size="small"
                                                value={editingNote}
                                                onChange={e => setEditingNote(e.target.value)}
                                                placeholder="Nota de la orden…"
                                                style={{ flex: 1, marginRight: 8, fontFamily: 'sans-serif' }}
                                            />
                                        ) : (
                                            <span className="pm-cart__order-note">
                                                {order.description || 'Sin nota'}
                                            </span>
                                        )}
                                        <div className="pm-cart__order-actions">
                                            {editingOrder === order.orderCode ? (
                                                <button
                                                    style={{ background: '#D4873A', color: 'white', border: 'none', borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}
                                                    onClick={() => saveNote(order.orderCode)}
                                                >
                                                    <FaCheck />
                                                </button>
                                            ) : (
                                                <button
                                                    style={{ background: '#F5ECD8', color: '#8B5E3C', border: '1px solid #E8D5BC', borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}
                                                    onClick={() => { setEditingOrder(order.orderCode); setEditingNote(order.description); }}
                                                >
                                                    <FaPen />
                                                </button>
                                            )}
                                            <button
                                                style={{ background: '#fde8e8', color: '#c0392b', border: '1px solid #f5c6c6', borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}
                                                onClick={() => removeOrder(order.orderCode)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>

                                    {order.details.map(d => (
                                        <div key={d.productCode} className="pm-cart__detail-row">
                                            <span className="pm-cart__detail-name">{d.productName}</span>
                                            <div className="pm-cart__detail-controls">
                                                <button className="ctrl-btn" onClick={() => changeQty(order.orderCode, d.productCode, -1)}>
                                                    <FaMinus />
                                                </button>
                                                <span className="ctrl-qty">{d.quantity}</span>
                                                <button className="ctrl-btn" onClick={() => changeQty(order.orderCode, d.productCode, 1)}>
                                                    <FaPlus />
                                                </button>
                                                <span className="ctrl-price">$ {(d.price * d.quantity).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pm-cart__order-subtotal">
                                        Subtotal: <b>$ {calcOrderTotal(order).toFixed(2)}</b>
                                    </div>
                                </div>
                            ))}

                            <div className="pm-cart__total-row">
                                <span>Total</span>
                                <span>$ {cartTotal.toFixed(2)}</span>
                            </div>

                            <div className="pm-cart__checkout-fields">
                                <Input
                                    placeholder="Tu teléfono…"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    style={{ fontFamily: 'sans-serif' }}
                                />
                                <Input
                                    placeholder="Dirección de entrega…"
                                    prefix={<FaMapMarkerAlt style={{ color: '#B08A6E' }} />}
                                    value={delivery}
                                    onChange={e => setDelivery(e.target.value)}
                                    style={{ fontFamily: 'sans-serif' }}
                                />
                            </div>

                            <button
                                className="pm-cart__confirm-btn"
                                disabled={confirming}
                                onClick={confirmOrder}
                            >
                                {confirming ? 'Enviando…' : `Confirmar pedido — $ ${cartTotal.toFixed(2)}`}
                            </button>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

interface HeroProps { branch: Branch | null; franchiseName: string; }
const HeroSection: FC<HeroProps> = ({ branch, franchiseName }) => (
    <div className="pm-hero">
        {branch?.coverUrl
            ? <img src={branch.coverUrl} className="pm-hero__cover" alt="portada" />
            : <div className="pm-hero__cover-placeholder" />
        }
        <div className="pm-hero__overlay">
            {branch?.pictureUrl && (
                <img src={branch.pictureUrl} className="pm-hero__logo" alt="logo" />
            )}
            <div className="pm-hero__info">
                <h1>{franchiseName || 'Menú'}</h1>
                <div className="pm-hero__meta">
                    {branch?.city && (
                        <span>
                            <FaMapMarkerAlt />
                            {branch.city}{branch.address ? `, ${branch.address}` : ''}
                        </span>
                    )}
                </div>
            </div>
        </div>
    </div>
);

interface InfoBarProps { branch: Branch | null; }
const InfoBar: FC<InfoBarProps> = ({ branch }) => {
    const hasTime = branch?.openTime && branch?.closeTime;
    const hasSocials = branch?.instagramUrl || branch?.facebookUrl || branch?.whatsappUrl;
    if (!hasTime && !hasSocials) return null;
    return (
        <div className="pm-infobar">
            {hasTime && (
                <div className="pm-infobar__time">
                    <FaClock />
                    <span>{branch!.openTime} — {branch!.closeTime}</span>
                </div>
            )}
            {hasSocials && (
                <div className="pm-infobar__socials">
                    {branch?.instagramUrl && <a href={branch.instagramUrl} target="_blank" rel="noreferrer"><FaInstagram /></a>}
                    {branch?.facebookUrl  && <a href={branch.facebookUrl}  target="_blank" rel="noreferrer"><FaFacebook /></a>}
                    {branch?.whatsappUrl  && <a href={branch.whatsappUrl}  target="_blank" rel="noreferrer"><FaWhatsapp /></a>}
                </div>
            )}
        </div>
    );
};

interface MenuRowProps { product: Product; onClick: () => void; }
const MenuRow: FC<MenuRowProps> = ({ product, onClick }) => (
    <div
        className={`pm-item${!product.isAvailable ? ' unavailable' : ''}`}
        onClick={onClick}
    >
        <div className="pm-item__img-wrap">
            {product.pictureUrl
                ? <img src={product.pictureUrl} className="pm-item__img" alt={product.name} />
                : <div className="pm-item__img-placeholder"><FaUtensils /></div>
            }
        </div>
        <div className="pm-item__body">
            <p className="pm-item__name">{product.name}</p>
            {product.description && <p className="pm-item__desc">{product.description}</p>}
            <div className="pm-item__footer">
                <span className="pm-item__price">$ {product.price}</span>
                {!product.isAvailable
                    ? <span className="pm-item__unavailable-tag">No disponible</span>
                    : <span className="pm-item__hint"><FaPlus size={9} /> Agregar</span>
                }
            </div>
        </div>
    </div>
);
