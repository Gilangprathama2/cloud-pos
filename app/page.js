"use client";

import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] =
    useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProducts();
    loadTransactions();
    loadStatistics();
  }, []);

  // ==============================
  // LOAD PRODUCTS
  // ==============================

  async function loadProducts() {
    try {
      const response = await fetch(
        `${API_URL}?action=products`,
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (result.success) {
        setProducts(result.data);
      } else {
        setMessage(
          result.message ||
            "Gagal mengambil data produk"
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Gagal mengambil data produk"
      );
    } finally {
      setLoading(false);
    }
  }

  // ==============================
  // LOAD TRANSACTIONS
  // ==============================

  async function loadTransactions() {
    try {
      const response = await fetch(
        `${API_URL}?action=transactions`,
        {
          cache: "no-store",
        }
      );

      const result =
        await response.json();

      if (result.success) {
        setTransactions(result.data);
      }
    } catch (error) {
      console.error(
        "Gagal mengambil transaksi:",
        error
      );
    }
  }

  // ==============================
  // LOAD STATISTICS
  // ==============================

  async function loadStatistics() {
    try {
      const response = await fetch(
        `${API_URL}?action=statistics`,
        {
          cache: "no-store",
        }
      );

      const result =
        await response.json();

      if (result.success) {
        setStatistics(result.data);
      }
    } catch (error) {
      console.error(
        "Gagal mengambil statistik:",
        error
      );
    }
  }

  // ==============================
  // ADD TO CART
  // ==============================

  function addToCart(product) {
    if (Number(product.stock) <= 0) {
      setMessage(
        `Stok ${product.name} habis`
      );

      return;
    }

    const existing = cart.find(
      (item) =>
        item.id === product.id
    );

    if (existing) {
      if (
        existing.quantity >=
        Number(product.stock)
      ) {
        setMessage(
          `Stok ${product.name} hanya tersedia ${product.stock}`
        );

        return;
      }

      setCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
        )
      );

      return;
    }

    setCart([
      ...cart,
      {
        ...product,
        quantity: 1,
      },
    ]);

    setMessage("");
  }

  // ==============================
  // REMOVE FROM CART
  // ==============================

  function removeFromCart(productId) {
    setCart(
      cart.filter(
        (item) =>
          item.id !== productId
      )
    );
  }

  // ==============================
  // DECREASE QUANTITY
  // ==============================

  function decreaseQuantity(productId) {
    setCart(
      cart
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  }

  // ==============================
  // INCREASE QUANTITY
  // ==============================

  function increaseQuantity(productId) {
    const product =
      products.find(
        (item) =>
          item.id === productId
      );

    const cartItem =
      cart.find(
        (item) =>
          item.id === productId
      );

    if (!product || !cartItem) {
      return;
    }

    if (
      cartItem.quantity >=
      Number(product.stock)
    ) {
      setMessage(
        `Stok ${product.name} hanya tersedia ${product.stock}`
      );

      return;
    }

    setCart(
      cart.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );

    setMessage("");
  }

  // ==============================
  // CALCULATE CART TOTAL
  // ==============================

  function calculateTotal() {
    return cart.reduce(
      (total, item) =>
        total +
        Number(item.price) *
          Number(item.quantity),
      0
    );
  }

  // ==============================
  // CHECKOUT
  // ==============================

  async function checkout() {
    if (cart.length === 0) {
      setMessage(
        "Keranjang masih kosong"
      );

      return;
    }

    if (checkoutLoading) {
      return;
    }

    setCheckoutLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}?action=transaction`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            items: cart,
          }),
        }
      );

      const result =
        await response.json();

      if (result.success) {
        setMessage(
          `Transaksi berhasil! ID transaksi: ${result.data.transaction_id}`
        );

        setCart([]);

        // Refresh data
        await loadProducts();
        await loadTransactions();
        await loadStatistics();
      } else {
        setMessage(
          result.message ||
            "Transaksi gagal"
        );
      }
    } catch (error) {
      console.error(
        "Error checkout:",
        error
      );

      setMessage(
        "Terjadi kesalahan saat melakukan transaksi"
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

  // ==============================
  // FORMAT RUPIAH
  // ==============================

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

  const totalCartItems =
    cart.reduce(
      (total, item) =>
        total +
        Number(item.quantity),
      0
    );

  return (
    <main className="container">

      {/* HEADER */}

      <header className="header">

        <div>

          <p className="label">
            CLOUD COMPUTING
          </p>

          <h1>
            Cloud POS
          </h1>

          <p className="subtitle">
            Point of Sale berbasis Cloud Bridge
          </p>

        </div>

        <div className="status">

          <span className="status-dot"></span>

          Online

        </div>

      </header>


      {/* STATISTICS */}

      <section className="stats">

        <div className="stat-card">

          <span>
            Total Produk
          </span>

          <strong>
            {statistics
              ? statistics.total_products
              : "..."}
          </strong>

        </div>


        <div className="stat-card">

          <span>
            Total Transaksi
          </span>

          <strong>
            {statistics
              ? statistics.total_transactions
              : "..."}
          </strong>

        </div>


        <div className="stat-card">

          <span>
            Total Penjualan
          </span>

          <strong>
            {statistics
              ? formatRupiah(
                  statistics.total_sales
                )
              : "..."}
          </strong>

        </div>


        <div className="stat-card">

          <span>
            Total Stok
          </span>

          <strong>
            {statistics
              ? statistics.total_stock
              : "..."}
          </strong>

        </div>

      </section>


      {/* BEST PRODUCT */}

      {statistics?.best_product && (
        <section className="best-product">

          <div>

            <span>
              Produk Terlaris
            </span>

            <h2>
              {statistics.best_product.name}
            </h2>

          </div>

          <strong>
            {statistics.best_product.quantity}
            {" "}
            terjual
          </strong>

        </section>
      )}


      {/* MESSAGE */}

      {message && (
        <div className="message">
          {message}
        </div>
      )}


      {/* MAIN CONTENT */}

      <section className="content">


        {/* PRODUCTS */}

        <div className="products-section">

          <div className="section-header">

            <div>

              <h2>
                Daftar Produk
              </h2>

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

              {products.map(
                (product) => (

                  <div
                    className="product-card"
                    key={product.id}
                  >

                    <div className="product-icon">
                      🛒
                    </div>

                    <h3>
                      {product.name}
                    </h3>

                    <p className="price">
                      {formatRupiah(
                        product.price
                      )}
                    </p>

                    <p
                      className="stock"
                      style={{
                        color:
                          Number(
                            product.stock
                          ) === 0
                            ? "#dc2626"
                            : Number(
                                product.stock
                              ) <= 10
                            ? "#d97706"
                            : undefined,
                      }}
                    >

                      Stok:{" "}
                      {product.stock}

                    </p>


                    <button
                      onClick={() =>
                        addToCart(
                          product
                        )
                      }

                      disabled={
                        Number(
                          product.stock
                        ) <= 0
                      }
                    >

                      {Number(
                        product.stock
                      ) <= 0
                        ? "Stok Habis"
                        : "+ Tambah"}

                    </button>

                  </div>

                )
              )}

            </div>

          )}

        </div>


        {/* CART */}

        <aside className="cart-section">

          <div className="cart-header">

            <div>

              <h2>
                Keranjang
              </h2>

              <p>
                {totalCartItems} item
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

                {cart.map(
                  (item) => (

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

                  )
                )}

              </div>


              <div className="cart-total">

                <span>
                  Total
                </span>

                <strong>
                  {formatRupiah(
                    calculateTotal()
                  )}
                </strong>

              </div>


              <button
                className="checkout"
                onClick={checkout}
                disabled={
                  checkoutLoading
                }
              >

                {checkoutLoading
                  ? "Memproses..."
                  : "Bayar Sekarang"}

              </button>

            </>

          )}

        </aside>

      </section>


      {/* TRANSACTION HISTORY */}

      <section className="history">

        <div className="section-header">

          <div>

            <h2>
              Riwayat Transaksi
            </h2>

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


      {/* FOOTER */}

      <footer>
        Cloud POS — UTS Cloud Computing
      </footer>

    </main>
  );
}
