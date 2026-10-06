"use client";

import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProducts();
    loadTransactions();
  }, []);

  async function loadProducts() {
    try {
      const response = await fetch(
        `${API_URL}?action=products`
      );

      const result = await response.json();

      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error(error);
      setMessage("Gagal mengambil data produk");
    } finally {
      setLoading(false);
    }
  }

  async function loadTransactions() {
    try {
      const response = await fetch(
        `${API_URL}?action=transactions`
      );

      const result = await response.json();

      if (result.success) {
        setTransactions(result.data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function addToCart(product) {
    const existing = cart.find(
      (item) => item.id === product.id
    );

    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...product,
          quantity: 1,
        },
      ]);
    }
  }

  function removeFromCart(productId) {
    setCart(
      cart.filter(
        (item) => item.id !== productId
      )
    );
  }

  function decreaseQuantity(productId) {
    setCart(
      cart
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function increaseQuantity(productId) {
    setCart(
      cart.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  }

  function calculateTotal() {
    return cart.reduce(
      (total, item) =>
        total +
        Number(item.price) *
          Number(item.quantity),
      0
    );
  }

  async function checkout() {
    if (cart.length === 0) {
      setMessage("Keranjang masih kosong");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}?action=transaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: cart,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setMessage(
          `Transaksi berhasil! ID transaksi: ${result.data.transaction_id}`
        );

        setCart([]);

        loadTransactions();
      } else {
        setMessage(
          result.message ||
            "Transaksi gagal"
        );
      }
    } catch (error) {
      console.error(error);
      setMessage(
        "Terjadi kesalahan saat transaksi"
      );
    }
  }

  function formatRupiah(value) {
    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }
    ).format(value);
  }

  const totalSales = transactions.reduce(
    (total, transaction) =>
      total + Number(transaction.total),
    0
  );

  return (
    <main className="container">
      <header className="header">
        <div>
          <p className="label">
            CLOUD COMPUTING
          </p>

          <h1>Cloud POS</h1>

          <p className="subtitle">
            Point of Sale berbasis Cloud Bridge
          </p>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          Online
        </div>
      </header>

      <section className="stats">
        <div className="stat-card">
          <span>Total Produk</span>
          <strong>{products.length}</strong>
        </div>

        <div className="stat-card">
          <span>Total Transaksi</span>
          <strong>
            {transactions.length}
          </strong>
        </div>

        <div className="stat-card">
          <span>Total Penjualan</span>
          <strong>
            {formatRupiah(totalSales)}
          </strong>
        </div>
      </section>

      {message && (
        <div className="message">
          {message}
        </div>
      )}

      <section className="content">
        <div className="products-section">
          <div className="section-header">
            <div>
              <h2>Daftar Produk</h2>
              <p>
                Produk dari PostgreSQL
              </p>
            </div>
          </div>

          {loading ? (
            <div className="loading">
              Memuat produk...
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <div
                  className="product-card"
                  key={product.id}
                >
                  <div className="product-icon">
                    🛒
                  </div>

                  <h3>{product.name}</h3>

                  <p className="price">
                    {formatRupiah(
                      product.price
                    )}
                  </p>

                  <p className="stock">
                    Stok: {product.stock}
                  </p>

                  <button
                    onClick={() =>
                      addToCart(product)
                    }
                  >
                    + Tambah
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="cart-section">
          <div className="cart-header">
            <div>
              <h2>Keranjang</h2>
              <p>
                {cart.length} jenis produk
              </p>
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-icon">
                🛒
              </div>

              <p>
                Belum ada produk
              </p>

              <span>
                Tambahkan produk dari daftar
              </span>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div
                    className="cart-item"
                    key={item.id}
                  >
                    <div className="cart-info">
                      <strong>
                        {item.name}
                      </strong>

                      <span>
                        {formatRupiah(
                          item.price
                        )}
                      </span>
                    </div>

                    <div className="quantity">
                      <button
                        onClick={() =>
                          decreaseQuantity(
                            item.id
                          )
                        }
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(
                            item.id
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="remove"
                      onClick={() =>
                        removeFromCart(
                          item.id
                        )
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-total">
                <span>Total</span>

                <strong>
                  {formatRupiah(
                    calculateTotal()
                  )}
                </strong>
              </div>

              <button
                className="checkout"
                onClick={checkout}
              >
                Bayar Sekarang
              </button>
            </>
          )}
        </aside>
      </section>

      <section className="history">
        <div className="section-header">
          <div>
            <h2>Riwayat Transaksi</h2>
            <p>
              Data transaksi dari Cloud Database
            </p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-history">
            Belum ada transaksi.
          </div>
        ) : (
          <div className="transaction-list">
            {transactions.map(
              (transaction) => (
                <div
                  className="transaction"
                  key={transaction.id}
                >
                  <div>
                    <strong>
                      Transaksi #
                      {transaction.id}
                    </strong>

                    <span>
                      {new Date(
                        transaction.created_at
                      ).toLocaleString(
                        "id-ID"
                      )}
                    </span>
                  </div>

                  <strong>
                    {formatRupiah(
                      transaction.total
                    )}
                  </strong>
                </div>
              )
            )}
          </div>
        )}
      </section>

      <footer>
        Cloud POS — UTS Cloud Computing
      </footer>
    </main>
  );
}