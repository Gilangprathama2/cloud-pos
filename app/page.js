"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  // ========================================
  // MAIN STATE
  // ========================================

  const [activePage, setActivePage] =
    useState("dashboard");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [products, setProducts] =
    useState([]);

  const [transactions, setTransactions] =
    useState([]);

  const [statistics, setStatistics] =
    useState(null);

  const [predictions, setPredictions] =
    useState([]);

  const [reports, setReports] =
    useState(null);

  const [cart, setCart] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [predictionLoading, setPredictionLoading] =
    useState(true);

  const [reportLoading, setReportLoading] =
    useState(false);

  const [checkoutLoading, setCheckoutLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("success");


  // ========================================
  // SEARCH
  // ========================================

  const [productSearch, setProductSearch] =
    useState("");

  const [transactionSearch, setTransactionSearch] =
    useState("");


  // ========================================
  // REPORT PERIOD
  // ========================================

  const [reportPeriod, setReportPeriod] =
    useState("daily");


  // ========================================
  // PRODUCT MODAL
  // ========================================

  const [showProductModal, setShowProductModal] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [productForm, setProductForm] =
    useState({
      name: "",
      price: "",
      stock: "",
    });

  const [productSaving, setProductSaving] =
    useState(false);


  // ========================================
  // TRANSACTION DETAIL MODAL
  // ========================================

  const [showTransactionModal, setShowTransactionModal] =
    useState(false);

  const [selectedTransaction, setSelectedTransaction] =
    useState(null);

  const [transactionDetailLoading, setTransactionDetailLoading] =
    useState(false);


  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    loadAllData();
  }, []);


  // ========================================
  // AUTO CLEAR MESSAGE
  // ========================================

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer =
      setTimeout(() => {
        setMessage("");
      }, 4000);

    return () => clearTimeout(timer);
  }, [message]);


  // ========================================
  // LOAD ALL DATA
  // ========================================

  async function loadAllData() {
    await Promise.all([
      loadProducts(),
      loadTransactions(),
      loadStatistics(),
      loadPredictions(),
      loadReports("daily"),
    ]);
  }


  // ========================================
  // SHOW MESSAGE
  // ========================================

  function showMessage(
    text,
    type = "success"
  ) {
    setMessage(text);
    setMessageType(type);
  }


  // ========================================
  // API HELPER
  // ========================================

  async function apiRequest(
    endpoint,
    options = {}
  ) {
    const response =
      await fetch(
        `${API_URL}${endpoint}`,
        {
          cache: "no-store",
          ...options,
        }
      );

    const result =
      await response.json();

    return {
      response,
      result,
    };
  }


  // ========================================
  // LOAD PRODUCTS
  // ========================================

  async function loadProducts() {
    try {
      setLoading(true);

      const {
        result,
      } =
        await apiRequest(
          "?action=products"
        );

      if (result.success) {
        setProducts(
          result.data || []
        );
      } else {
        showMessage(
          result.message ||
            "Gagal mengambil produk",
          "error"
        );
      }

    } catch (error) {
      console.error(error);

      showMessage(
        "Gagal terhubung ke server",
        "error"
      );

    } finally {
      setLoading(false);
    }
  }


  // ========================================
  // LOAD TRANSACTIONS
  // ========================================

  async function loadTransactions() {
    try {
      const {
        result,
      } =
        await apiRequest(
          "?action=transactions"
        );

      if (result.success) {
        setTransactions(
          result.data || []
        );
      }

    } catch (error) {
      console.error(error);
    }
  }


  // ========================================
  // LOAD STATISTICS
  // ========================================

  async function loadStatistics() {
    try {
      const {
        result,
      } =
        await apiRequest(
          "?action=statistics"
        );

      if (result.success) {
        setStatistics(
          result.data
        );
      }

    } catch (error) {
      console.error(error);
    }
  }


  // ========================================
  // LOAD PREDICTIONS
  // ========================================

  async function loadPredictions() {
    try {
      setPredictionLoading(true);

      const {
        result,
      } =
        await apiRequest(
          "?action=prediction"
        );

      if (result.success) {
        setPredictions(
          result.data || []
        );
      }

    } catch (error) {
      console.error(error);
    } finally {
      setPredictionLoading(false);
    }
  }


  // ========================================
  // LOAD REPORTS
  // ========================================

  async function loadReports(
    period
  ) {
    try {
      setReportLoading(true);

      const {
        result,
      } =
        await apiRequest(
          `?action=reports&period=${period}`
        );

      if (result.success) {
        setReports(
          result.data
        );
      }

    } catch (error) {
      console.error(error);
    } finally {
      setReportLoading(false);
    }
  }


  // ========================================
  // NAVIGATION
  // ========================================

  function navigate(page) {
    setActivePage(page);
    setSidebarOpen(false);

    if (
      page === "dashboard"
    ) {
      loadStatistics();
      loadPredictions();
    }

    if (
      page === "laporan"
    ) {
      loadReports(reportPeriod);
    }
  }


  // ========================================
  // FORMAT RUPIAH
  // ========================================

  function formatRupiah(value) {
    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }
    ).format(
      Number(value) || 0
    );
  }


  // ========================================
  // FORMAT DATE
  // ========================================

  function formatDate(date) {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleString(
      "id-ID",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }


  // ========================================
  // CART TOTAL
  // ========================================

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(item.price) *
          Number(item.quantity),
      0
    );
  }, [cart]);


  // ========================================
  // CART ITEM COUNT
  // ========================================

  const cartItemCount = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(item.quantity),
      0
    );
  }, [cart]);


  // ========================================
  // FILTER PRODUCTS
  // ========================================

  const filteredProducts =
    products.filter(
      (product) =>
        product.name
          .toLowerCase()
          .includes(
            productSearch
              .toLowerCase()
          )
    );


  // ========================================
  // FILTER TRANSACTIONS
  // ========================================

  const filteredTransactions =
    transactions.filter(
      (transaction) =>
        String(
          transaction.id
        )
          .includes(
            transactionSearch
          )
    );


  // ========================================
  // ADD TO CART
  // ========================================

  function addToCart(product) {
    if (
      Number(product.stock) <= 0
    ) {
      showMessage(
        `${product.name} sedang habis`,
        "error"
      );

      return;
    }

    const existing =
      cart.find(
        (item) =>
          Number(item.id) ===
          Number(product.id)
      );

    if (existing) {
      if (
        existing.quantity >=
        Number(product.stock)
      ) {
        showMessage(
          `Stok ${product.name} hanya ${product.stock}`,
          "error"
        );

        return;
      }

      setCart(
        cart.map(
          (item) =>
            Number(item.id) ===
            Number(product.id)
              ? {
                  ...item,
                  quantity:
                    item.quantity + 1,
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

    showMessage(
      `${product.name} ditambahkan ke keranjang`
    );
  }


  // ========================================
  // INCREASE CART
  // ========================================

  function increaseCart(productId) {
    const product =
      products.find(
        (item) =>
          Number(item.id) ===
          Number(productId)
      );

    const cartItem =
      cart.find(
        (item) =>
          Number(item.id) ===
          Number(productId)
      );

    if (!product || !cartItem) {
      return;
    }

    if (
      cartItem.quantity >=
      Number(product.stock)
    ) {
      showMessage(
        "Jumlah sudah mencapai stok tersedia",
        "error"
      );

      return;
    }

    setCart(
      cart.map(
        (item) =>
          Number(item.id) ===
          Number(productId)
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
      )
    );
  }


  // ========================================
  // DECREASE CART
  // ========================================

  function decreaseCart(productId) {
    setCart(
      cart
        .map(
          (item) =>
            Number(item.id) ===
            Number(productId)
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


  // ========================================
  // REMOVE CART ITEM
  // ========================================

  function removeCartItem(productId) {
    setCart(
      cart.filter(
        (item) =>
          Number(item.id) !==
          Number(productId)
      )
    );
  }


  // ========================================
  // CHECKOUT
  // ========================================

  async function checkout() {
    if (
      cart.length === 0
    ) {
      showMessage(
        "Keranjang masih kosong",
        "error"
      );

      return;
    }

    setCheckoutLoading(true);

    try {
      const {
        result,
      } =
        await apiRequest(
          "?action=transaction",
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

      if (result.success) {
        setCart([]);

        showMessage(
          `Transaksi #${result.data.transaction_id} berhasil`
        );

        await Promise.all([
          loadProducts(),
          loadTransactions(),
          loadStatistics(),
          loadPredictions(),
          loadReports(
            reportPeriod
          ),
        ]);

      } else {
        showMessage(
          result.message ||
            "Transaksi gagal",
          "error"
        );
      }

    } catch (error) {
      console.error(error);

      showMessage(
        "Terjadi kesalahan saat checkout",
        "error"
      );

    } finally {
      setCheckoutLoading(false);
    }
  }


  // ========================================
  // OPEN ADD PRODUCT
  // ========================================

  function openAddProduct() {
    setEditingProduct(null);

    setProductForm({
      name: "",
      price: "",
      stock: "",
    });

    setShowProductModal(true);
  }


  // ========================================
  // OPEN EDIT PRODUCT
  // ========================================

  function openEditProduct(product) {
    setEditingProduct(product);

    setProductForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
    });

    setShowProductModal(true);
  }


  // ========================================
  // SAVE PRODUCT
  // ========================================

  async function saveProduct(
    event
  ) {
    event.preventDefault();

    setProductSaving(true);

    try {
      const payload = {
        name:
          productForm.name,

        price:
          Number(
            productForm.price
          ),

        stock:
          Number(
            productForm.stock
          ),
      };


      let result;


      if (editingProduct) {

        const response =
          await apiRequest(
            "?action=product",
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                id:
                  editingProduct.id,

                ...payload,
              }),
            }
          );

        result =
          response.result;

      } else {

        const response =
          await apiRequest(
            "?action=product",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify(
                payload
              ),
            }
          );

        result =
          response.result;
      }


      if (result.success) {

        setShowProductModal(
          false
        );

        showMessage(
          editingProduct
            ? "Produk berhasil diperbarui"
            : "Produk berhasil ditambahkan"
        );

        await Promise.all([
          loadProducts(),
          loadStatistics(),
          loadPredictions(),
        ]);

      } else {

        showMessage(
          result.message ||
            "Gagal menyimpan produk",
          "error"
        );
      }

    } catch (error) {
      console.error(error);

      showMessage(
        "Gagal menyimpan produk",
        "error"
      );

    } finally {
      setProductSaving(false);
    }
  }


  // ========================================
  // DELETE PRODUCT
  // ========================================

  async function deleteProduct(
    product
  ) {
    const confirmed =
      window.confirm(
        `Hapus produk "${product.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {

      const {
        result,
      } =
        await apiRequest(
          `?action=product&id=${product.id}`,
          {
            method: "DELETE",
          }
        );


      if (result.success) {

        showMessage(
          "Produk berhasil dihapus"
        );

        await Promise.all([
          loadProducts(),
          loadStatistics(),
          loadPredictions(),
        ]);

      } else {

        showMessage(
          result.message ||
            "Produk gagal dihapus",
          "error"
        );
      }

    } catch (error) {
      console.error(error);

      showMessage(
        "Terjadi kesalahan",
        "error"
      );
    }
  }


  // ========================================
  // TRANSACTION DETAIL
  // ========================================

  async function openTransactionDetail(
    transaction
  ) {
    setSelectedTransaction(
      null
    );

    setShowTransactionModal(
      true
    );

    setTransactionDetailLoading(
      true
    );

    try {

      const {
        result,
      } =
        await apiRequest(
          `?action=transaction-detail&id=${transaction.id}`
        );


      if (result.success) {

        setSelectedTransaction(
          result.data
        );

      } else {

        showMessage(
          result.message ||
            "Detail transaksi gagal diambil",
          "error"
        );

        setShowTransactionModal(
          false
        );
      }

    } catch (error) {
      console.error(error);

      showMessage(
        "Gagal mengambil detail transaksi",
        "error"
      );

      setShowTransactionModal(
        false
      );

    } finally {
      setTransactionDetailLoading(
        false
      );
    }
  }


  // ========================================
  // SIDEBAR MENU
  // ========================================

  const menuItems = [
    {
      id: "dashboard",
      icon: "⌂",
      label: "Dashboard",
    },
    {
      id: "kasir",
      icon: "🛒",
      label: "Kasir",
      badge:
        cartItemCount > 0
          ? cartItemCount
          : null,
    },
    {
      id: "produk",
      icon: "▦",
      label: "Produk",
    },
    {
      id: "transaksi",
      icon: "▤",
      label: "Transaksi",
    },
    {
      id: "laporan",
      icon: "◒",
      label: "Laporan",
    },
    {
      id: "prediksi",
      icon: "⌁",
      label: "Prediksi ML",
    },
  ];


  // ========================================
  // PAGE TITLE
  // ========================================

  const pageTitles = {
    dashboard: {
      title: "Dashboard",
      description:
        "Ringkasan aktivitas Cloud POS",
    },

    kasir: {
      title: "Kasir",
      description:
        "Kelola penjualan dan checkout",
    },

    produk: {
      title: "Manajemen Produk",
      description:
        "Kelola produk, harga dan stok",
    },

    transaksi: {
      title: "Transaksi",
      description:
        "Riwayat transaksi penjualan",
    },

    laporan: {
      title: "Laporan Penjualan",
      description:
        "Analisis penjualan dari PostgreSQL",
    },

    prediksi: {
      title: "Prediksi & Restock",
      description:
        "Machine Learning untuk membantu persediaan",
    },
  };


  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="app-shell">

      {/* =====================================
          MOBILE OVERLAY
          ===================================== */}

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}


      {/* =====================================
          SIDEBAR
          ===================================== */}

      <aside
        className={`sidebar ${
          sidebarOpen
            ? "sidebar-open"
            : ""
        }`}
      >

        <div className="sidebar-brand">

          <div className="brand-icon">
            CP
          </div>

          <div>
            <strong>
              Cloud POS
            </strong>

            <span>
              Cloud Bridge System
            </span>
          </div>

        </div>


        <div className="menu-label">
          MENU UTAMA
        </div>


        <nav className="sidebar-menu">

          {menuItems.map(
            (item) => (

              <button
                key={item.id}

                className={`menu-item ${
                  activePage ===
                  item.id
                    ? "active"
                    : ""
                }`}

                onClick={() =>
                  navigate(
                    item.id
                  )
                }
              >

                <span className="menu-icon">
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>

                {item.badge && (
                  <span className="menu-badge">
                    {item.badge}
                  </span>
                )}

              </button>

            )
          )}

        </nav>


        <div className="sidebar-bottom">

          <div className="cloud-status">

            <span className="online-dot"></span>

            <div>
              <strong>
                Cloud Online
              </strong>

              <small>
                Vercel + Supabase
              </small>
            </div>

          </div>

        </div>

      </aside>


      {/* =====================================
          MAIN
          ===================================== */}

      <div className="main-wrapper">


        {/* ===================================
            TOPBAR
            =================================== */}

        <header className="topbar">

          <button
            className="mobile-menu-button"
            onClick={() =>
              setSidebarOpen(
                !sidebarOpen
              )
            }
          >
            ☰
          </button>


          <div className="topbar-title">

            <h1>
              {
                pageTitles[
                  activePage
                ].title
              }
            </h1>

            <p>
              {
                pageTitles[
                  activePage
                ].description
              }
            </p>

          </div>


          <div className="topbar-actions">

            <div className="connection-status">

              <span></span>

              Online

            </div>

          </div>

        </header>


        {/* ===================================
            CONTENT
            =================================== */}

        <main className="main-content">


          {/* =================================
              NOTIFICATION
              ================================= */}

          {message && (

            <div
              className={`notification ${
                messageType ===
                "error"
                  ? "notification-error"
                  : "notification-success"
              }`}
            >

              <span>
                {messageType ===
                "error"
                  ? "!"
                  : "✓"}
              </span>

              {message}

              <button
                onClick={() =>
                  setMessage("")
                }
              >
                ×
              </button>

            </div>

          )}


          {/* =================================
              DASHBOARD
              ================================= */}

          {activePage ===
            "dashboard" && (

            <DashboardPage
              statistics={
                statistics
              }
              predictions={
                predictions
              }
              transactions={
                transactions
              }
              products={
                products
              }
              loading={
                loading
              }
              predictionLoading={
                predictionLoading
              }
              formatRupiah={
                formatRupiah
              }
              formatDate={
                formatDate
              }
              onNavigate={
                navigate
              }
            />

          )}


          {/* =================================
              KASIR
              ================================= */}

          {activePage ===
            "kasir" && (

            <KasirPage
              products={
                filteredProducts
              }
              productSearch={
                productSearch
              }
              setProductSearch={
                setProductSearch
              }
              cart={
                cart
              }
              cartTotal={
                cartTotal
              }
              cartItemCount={
                cartItemCount
              }
              loading={
                loading
              }
              addToCart={
                addToCart
              }
              increaseCart={
                increaseCart
              }
              decreaseCart={
                decreaseCart
              }
              removeCartItem={
                removeCartItem
              }
              checkout={
                checkout
              }
              checkoutLoading={
                checkoutLoading
              }
              formatRupiah={
                formatRupiah
              }
            />

          )}


          {/* =================================
              PRODUK
              ================================= */}

          {activePage ===
            "produk" && (

            <ProductsPage
              products={
                filteredProducts
              }
              search={
                productSearch
              }
              setSearch={
                setProductSearch
              }
              loading={
                loading
              }
              formatRupiah={
                formatRupiah
              }
              openAddProduct={
                openAddProduct
              }
              openEditProduct={
                openEditProduct
              }
              deleteProduct={
                deleteProduct
              }
            />

          )}


          {/* =================================
              TRANSAKSI
              ================================= */}

          {activePage ===
            "transaksi" && (

            <TransactionsPage
              transactions={
                filteredTransactions
              }
              search={
                transactionSearch
              }
              setSearch={
                setTransactionSearch
              }
              formatRupiah={
                formatRupiah
              }
              formatDate={
                formatDate
              }
              openDetail={
                openTransactionDetail
              }
            />

          )}


          {/* =================================
              LAPORAN
              ================================= */}

          {activePage ===
            "laporan" && (

            <ReportsPage
              reports={
                reports
              }
              period={
                reportPeriod
              }
              setPeriod={
                setReportPeriod
              }
              loading={
                reportLoading
              }
              loadReports={
                loadReports
              }
              formatRupiah={
                formatRupiah
              }
            />

          )}


          {/* =================================
              PREDIKSI
              ================================= */}

          {activePage ===
            "prediksi" && (

            <PredictionPage
              predictions={
                predictions
              }
              loading={
                predictionLoading
              }
              formatRupiah={
                formatRupiah
              }
            />

          )}

        </main>


        {/* ===================================
            FOOTER
            =================================== */}

        <footer className="app-footer">

          <span>
            Cloud POS
          </span>

          <span>
            UTS Cloud Computing
          </span>

          <span>
            Vercel × Supabase × PostgreSQL × ML
          </span>

        </footer>

      </div>


      {/* =====================================
          PRODUCT MODAL
          ===================================== */}

      {showProductModal && (

        <div className="modal-backdrop">

          <div className="modal">

            <div className="modal-header">

              <div>

                <h2>
                  {editingProduct
                    ? "Edit Produk"
                    : "Tambah Produk"}
                </h2>

                <p>
                  Masukkan informasi produk
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowProductModal(
                    false
                  )
                }
              >
                ×
              </button>

            </div>


            <form
              onSubmit={
                saveProduct
              }
            >

              <div className="form-group">

                <label>
                  Nama Produk
                </label>

                <input
                  type="text"
                  value={
                    productForm.name
                  }
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      name:
                        event.target
                          .value,
                    })
                  }
                  placeholder="Contoh: Indomie Goreng"
                  required
                />

              </div>


              <div className="form-row">

                <div className="form-group">

                  <label>
                    Harga
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      productForm.price
                    }
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        price:
                          event.target
                            .value,
                      })
                    }
                    placeholder="3500"
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    Stok
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      productForm.stock
                    }
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        stock:
                          event.target
                            .value,
                      })
                    }
                    placeholder="100"
                    required
                  />

                </div>

              </div>


              <div className="modal-actions">

                <button
                  type="button"
                  className="button-secondary"
                  onClick={() =>
                    setShowProductModal(
                      false
                    )
                  }
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="button-primary"
                  disabled={
                    productSaving
                  }
                >
                  {productSaving
                    ? "Menyimpan..."
                    : "Simpan Produk"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =====================================
          TRANSACTION DETAIL MODAL
          ===================================== */}

      {showTransactionModal && (

        <div className="modal-backdrop">

          <div className="modal modal-large">

            <div className="modal-header">

              <div>

                <h2>
                  Detail Transaksi
                </h2>

                <p>
                  Informasi lengkap transaksi
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowTransactionModal(
                    false
                  )
                }
              >
                ×
              </button>

            </div>


            {transactionDetailLoading ? (

              <div className="modal-loading">
                Memuat detail transaksi...
              </div>

            ) : selectedTransaction ? (

              <>

                <div className="transaction-detail-head">

                  <div>

                    <span>
                      ID Transaksi
                    </span>

                    <strong>
                      #
                      {
                        selectedTransaction
                          .transaction
                          .id
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      Tanggal
                    </span>

                    <strong>
                      {
                        formatDate(
                          selectedTransaction
                            .transaction
                            .created_at
                        )
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      Total
                    </span>

                    <strong>
                      {formatRupiah(
                        selectedTransaction
                          .transaction
                          .total
                      )}
                    </strong>

                  </div>

                </div>


                <div className="detail-table">

                  <div className="detail-row detail-head">

                    <span>
                      Produk
                    </span>

                    <span>
                      Qty
                    </span>

                    <span>
                      Harga
                    </span>

                    <span>
                      Subtotal
                    </span>

                  </div>


                  {selectedTransaction.items.map(
                    (item) => (

                      <div
                        className="detail-row"
                        key={item.id}
                      >

                        <span>
                          {
                            item.product_name
                          }
                        </span>

                        <span>
                          {item.quantity}
                        </span>

                        <span>
                          {formatRupiah(
                            item.price
                          )}
                        </span>

                        <span>
                          {formatRupiah(
                            item.subtotal
                          )}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </>

            ) : (

              <div className="modal-loading">
                Data tidak tersedia.
              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}


/* =====================================================
   DASHBOARD COMPONENT
   ===================================================== */

function DashboardPage({
  statistics,
  predictions,
  transactions,
  products,
  loading,
  predictionLoading,
  formatRupiah,
  formatDate,
  onNavigate,
}) {

  const lowStock =
    statistics
      ?.low_stock_products ||
    [];

  const topProducts =
    statistics
      ?.top_products ||
    [];


  return (
    <div className="page-content">

      <div className="welcome-banner">

        <div>

          <span>
            CLOUD POS
          </span>

          <h2>
            Selamat datang di dashboard 👋
          </h2>

          <p>
            Pantau penjualan, stok dan
            prediksi bisnis dari satu tempat.
          </p>

        </div>

        <button
          onClick={() =>
            onNavigate("kasir")
          }
        >
          Buka Kasir →
        </button>

      </div>


      {/* STAT CARDS */}

      <div className="dashboard-stats">

        <StatCard
          icon="▦"
          label="Total Produk"
          value={
            statistics
              ? statistics.total_products
              : "..."
          }
          description="Produk terdaftar"
        />

        <StatCard
          icon="▤"
          label="Total Transaksi"
          value={
            statistics
              ? statistics.total_transactions
              : "..."
          }
          description="Semua transaksi"
        />

        <StatCard
          icon="Rp"
          label="Total Penjualan"
          value={
            statistics
              ? formatRupiah(
                  statistics.total_sales
                )
              : "..."
          }
          description="Pendapatan"
        />

        <StatCard
          icon="◫"
          label="Total Stok"
          value={
            statistics
              ? statistics.total_stock
              : "..."
          }
          description="Unit tersedia"
        />

      </div>


      {/* TODAY */}

      <div className="mini-stat-grid">

        <div className="mini-stat">

          <div className="mini-icon">
            ◷
          </div>

          <div>

            <span>
              Penjualan Hari Ini
            </span>

            <strong>
              {statistics
                ? formatRupiah(
                    statistics.today_sales
                  )
                : "..."}
            </strong>

          </div>

        </div>


        <div className="mini-stat">

          <div className="mini-icon">
            #
          </div>

          <div>

            <span>
              Transaksi Hari Ini
            </span>

            <strong>
              {
                statistics
                  ?.today_transactions ??
                "..."
              }
            </strong>

          </div>

        </div>


        <div className="mini-stat">

          <div className="mini-icon">
            ★
          </div>

          <div>

            <span>
              Produk Terlaris
            </span>

            <strong>
              {
                statistics
                  ?.best_product
                  ?.name ||
                "Belum ada"
              }
            </strong>

          </div>

        </div>

      </div>


      <div className="dashboard-columns">


        {/* TOP PRODUCTS */}

        <section className="panel">

          <div className="panel-header">

            <div>

              <h3>
                Produk Terlaris
              </h3>

              <p>
                Berdasarkan jumlah terjual
              </p>

            </div>

            <button
              className="text-button"
              onClick={() =>
                onNavigate(
                  "laporan"
                )
              }
            >
              Lihat laporan
            </button>

          </div>


          {topProducts.length === 0 ? (

            <div className="empty-panel">
              Belum ada data penjualan.
            </div>

          ) : (

            <div className="top-product-list">

              {topProducts.map(
                (
                  product,
                  index
                ) => (

                  <div
                    className="top-product"
                    key={
                      product.id
                    }
                  >

                    <div className="rank">
                      {index + 1}
                    </div>

                    <div className="top-product-info">

                      <strong>
                        {product.name}
                      </strong>

                      <div className="progress-track">

                        <div
                          className="progress-fill"
                          style={{
                            width:
                              `${
                                Math.min(
                                  100,
                                  (
                                    product.quantity /
                                    Math.max(
                                      topProducts[0]
                                        ?.quantity ||
                                        1,
                                      1
                                    )
                                  ) *
                                    100
                                )
                              }%`,
                          }}
                        />

                      </div>

                    </div>

                    <strong>
                      {product.quantity}
                    </strong>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* LOW STOCK */}

        <section className="panel">

          <div className="panel-header">

            <div>

              <h3>
                Stok Perlu Diperhatikan
              </h3>

              <p>
                Stok 10 unit atau kurang
              </p>

            </div>

            <button
              className="text-button"
              onClick={() =>
                onNavigate(
                  "prediksi"
                )
              }
            >
              Lihat ML
            </button>

          </div>


          {lowStock.length === 0 ? (

            <div className="empty-panel success-empty">
              ✓ Semua stok dalam kondisi aman.
            </div>

          ) : (

            <div className="low-stock-list">

              {lowStock
                .slice(0, 5)
                .map(
                  (product) => (

                    <div
                      className="low-stock-item"
                      key={
                        product.id
                      }
                    >

                      <div>

                        <strong>
                          {product.name}
                        </strong>

                        <span>
                          Stok tersisa
                        </span>

                      </div>

                      <strong className="stock-number">
                        {product.stock}
                      </strong>

                    </div>

                  )
                )}

            </div>

          )}

        </section>

      </div>


      {/* RECENT TRANSACTIONS */}

      <section className="panel">

        <div className="panel-header">

          <div>

            <h3>
              Transaksi Terbaru
            </h3>

            <p>
              Aktivitas transaksi terakhir
            </p>

          </div>

          <button
            className="text-button"
            onClick={() =>
              onNavigate(
                "transaksi"
              )
            }
          >
            Lihat semua
          </button>

        </div>


        {transactions.length === 0 ? (

          <div className="empty-panel">
            Belum ada transaksi.
          </div>

        ) : (

          <div className="recent-transactions">

            {transactions
              .slice(0, 5)
              .map(
                (transaction) => (

                  <div
                    className="recent-transaction"
                    key={
                      transaction.id
                    }
                  >

                    <div className="transaction-avatar">
                      #
                    </div>

                    <div>

                      <strong>
                        Transaksi #
                        {
                          transaction.id
                        }
                      </strong>

                      <span>
                        {
                          formatDate(
                            transaction.created_at
                          )
                        }
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

    </div>
  );
}


/* =====================================================
   STAT CARD
   ===================================================== */

function StatCard({
  icon,
  label,
  value,
  description,
}) {
  return (
    <div className="stat-card-new">

      <div className="stat-card-top">

        <div className="stat-card-icon">
          {icon}
        </div>

        <span>
          {description}
        </span>

      </div>

      <div>

        <p>
          {label}
        </p>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
}


/* =====================================================
   KASIR
   ===================================================== */

function KasirPage({
  products,
  productSearch,
  setProductSearch,
  cart,
  cartTotal,
  cartItemCount,
  loading,
  addToCart,
  increaseCart,
  decreaseCart,
  removeCartItem,
  checkout,
  checkoutLoading,
  formatRupiah,
}) {

  return (
    <div className="page-content">

      <div className="cashier-layout">


        {/* PRODUCTS */}

        <section className="cashier-products">

          <div className="cashier-search">

            <div className="search-box">

              <span>
                ⌕
              </span>

              <input
                value={
                  productSearch
                }
                onChange={(event) =>
                  setProductSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Cari nama produk..."
              />

              {productSearch && (
                <button
                  onClick={() =>
                    setProductSearch(
                      ""
                    )
                  }
                >
                  ×
                </button>
              )}

            </div>

            <div className="result-count">
              {products.length} produk
            </div>

          </div>


          {loading ? (

            <div className="loading-box">
              Memuat produk...
            </div>

          ) : products.length === 0 ? (

            <div className="empty-panel">
              Produk tidak ditemukan.
            </div>

          ) : (

            <div className="cashier-grid">

              {products.map(
                (product) => (

                  <div
                    className="cashier-product"
                    key={
                      product.id
                    }
                  >

                    <div className="product-image-placeholder">
                      🛒
                    </div>

                    <div className="product-content">

                      <div className="product-stock-badge">
                        Stok {product.stock}
                      </div>

                      <h3>
                        {product.name}
                      </h3>

                      <strong>
                        {formatRupiah(
                          product.price
                        )}
                      </strong>

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

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* CART */}

        <aside className="cashier-cart">

          <div className="cart-title">

            <div>

              <h2>
                Keranjang
              </h2>

              <span>
                {cartItemCount} item
              </span>

            </div>

            {cart.length > 0 && (
              <span className="cart-count">
                {cartItemCount}
              </span>
            )}

          </div>


          {cart.length === 0 ? (

            <div className="cart-empty">

              <div>
                🛒
              </div>

              <strong>
                Keranjang kosong
              </strong>

              <span>
                Tambahkan produk untuk memulai
                transaksi.
              </span>

            </div>

          ) : (

            <>

              <div className="cart-product-list">

                {cart.map(
                  (item) => (

                    <div
                      className="cart-product"
                      key={
                        item.id
                      }
                    >

                      <div className="cart-product-info">

                        <strong>
                          {item.name}
                        </strong>

                        <span>
                          {formatRupiah(
                            item.price
                          )}
                        </span>

                      </div>


                      <div className="cart-controls">

                        <button
                          onClick={() =>
                            decreaseCart(
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
                            increaseCart(
                              item.id
                            )
                          }
                        >
                          +
                        </button>

                      </div>


                      <button
                        className="cart-remove"
                        onClick={() =>
                          removeCartItem(
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


              <div className="cart-summary">

                <div>

                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {formatRupiah(
                      cartTotal
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    Total
                  </span>

                  <strong className="cart-grand-total">
                    {formatRupiah(
                      cartTotal
                    )}
                  </strong>

                </div>

              </div>


              <button
                className="checkout-button"
                onClick={
                  checkout
                }
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

      </div>

    </div>
  );
}


/* =====================================================
   PRODUCTS
   ===================================================== */

function ProductsPage({
  products,
  search,
  setSearch,
  loading,
  formatRupiah,
  openAddProduct,
  openEditProduct,
  deleteProduct,
}) {

  return (
    <div className="page-content">

      <div className="page-toolbar">

        <div className="search-box product-search">

          <span>
            ⌕
          </span>

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Cari produk..."
          />

        </div>


        <button
          className="button-primary"
          onClick={
            openAddProduct
          }
        >
          + Tambah Produk
        </button>

      </div>


      <section className="panel">

        <div className="table-header">

          <div>

            <h3>
              Daftar Produk
            </h3>

            <p>
              {products.length} produk ditampilkan
            </p>

          </div>

        </div>


        {loading ? (

          <div className="loading-box">
            Memuat produk...
          </div>

        ) : products.length === 0 ? (

          <div className="empty-panel">
            Tidak ada produk yang sesuai.
          </div>

        ) : (

          <div className="responsive-table">

            <table>

              <thead>

                <tr>

                  <th>
                    Produk
                  </th>

                  <th>
                    Harga
                  </th>

                  <th>
                    Stok
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Aksi
                  </th>

                </tr>

              </thead>


              <tbody>

                {products.map(
                  (product) => {

                    const stock =
                      Number(
                        product.stock
                      );

                    return (

                      <tr
                        key={
                          product.id
                        }
                      >

                        <td>

                          <div className="table-product">

                            <div>
                              🛒
                            </div>

                            <strong>
                              {
                                product.name
                              }
                            </strong>

                          </div>

                        </td>


                        <td>
                          {formatRupiah(
                            product.price
                          )}
                        </td>


                        <td>
                          <strong>
                            {stock}
                          </strong>
                        </td>


                        <td>

                          <span
                            className={`status-pill ${
                              stock === 0
                                ? "danger"
                                : stock <= 10
                                ? "warning"
                                : "safe"
                            }`}
                          >
                            {stock === 0
                              ? "Habis"
                              : stock <= 10
                              ? "Menipis"
                              : "Tersedia"}
                          </span>

                        </td>


                        <td>

                          <div className="table-actions">

                            <button
                              className="edit-button"
                              onClick={() =>
                                openEditProduct(
                                  product
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-button"
                              onClick={() =>
                                deleteProduct(
                                  product
                                )
                              }
                            >
                              Hapus
                            </button>

                          </div>

                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}


/* =====================================================
   TRANSACTIONS
   ===================================================== */

function TransactionsPage({
  transactions,
  search,
  setSearch,
  formatRupiah,
  formatDate,
  openDetail,
}) {

  return (
    <div className="page-content">

      <div className="page-toolbar">

        <div className="search-box product-search">

          <span>
            ⌕
          </span>

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Cari ID transaksi..."
          />

        </div>

      </div>


      <section className="panel">

        <div className="table-header">

          <div>

            <h3>
              Riwayat Transaksi
            </h3>

            <p>
              {transactions.length} transaksi
            </p>

          </div>

        </div>


        {transactions.length ===
        0 ? (

          <div className="empty-panel">
            Belum ada transaksi.
          </div>

        ) : (

          <div className="responsive-table">

            <table>

              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Tanggal
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Aksi
                  </th>

                </tr>

              </thead>


              <tbody>

                {transactions.map(
                  (transaction) => (

                    <tr
                      key={
                        transaction.id
                      }
                    >

                      <td>
                        <strong>
                          #
                          {
                            transaction.id
                          }
                        </strong>
                      </td>

                      <td>
                        {
                          formatDate(
                            transaction.created_at
                          )
                        }
                      </td>

                      <td>
                        <strong>
                          {formatRupiah(
                            transaction.total
                          )}
                        </strong>
                      </td>

                      <td>

                        <button
                          className="detail-button"
                          onClick={() =>
                            openDetail(
                              transaction
                            )
                          }
                        >
                          Lihat Detail
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}


/* =====================================================
   REPORTS
   ===================================================== */

function ReportsPage({
  reports,
  period,
  setPeriod,
  loading,
  loadReports,
  formatRupiah,
}) {

  const chart =
    reports?.sales_chart ||
    [];

  const productChart =
    reports?.product_chart ||
    [];


  const maxSales =
    Math.max(
      ...chart.map(
        (item) =>
          Number(
            item.sales
          )
      ),
      1
    );


  const maxProduct =
    Math.max(
      ...productChart.map(
        (item) =>
          Number(
            item.quantity
          )
      ),
      1
    );


  return (
    <div className="page-content">

      <div className="report-toolbar">

        <div>

          <h2>
            Analisis Penjualan
          </h2>

          <p>
            Data diambil langsung dari
            PostgreSQL melalui REST API.
          </p>

        </div>


        <div className="period-tabs">

          <button
            className={
              period === "daily"
                ? "active"
                : ""
            }
            onClick={() => {
              setPeriod(
                "daily"
              );

              loadReports(
                "daily"
              );
            }}
          >
            Harian
          </button>


          <button
            className={
              period === "monthly"
                ? "active"
                : ""
            }
            onClick={() => {
              setPeriod(
                "monthly"
              );

              loadReports(
                "monthly"
              );
            }}
          >
            Bulanan
          </button>

        </div>

      </div>


      {loading ? (

        <div className="loading-box">
          Menghitung laporan...
        </div>

      ) : (

        <>

          <section className="panel chart-panel">

            <div className="panel-header">

              <div>

                <h3>
                  Grafik Penjualan
                </h3>

                <p>
                  Total penjualan berdasarkan periode
                </p>

              </div>

            </div>


            {chart.length === 0 ? (

              <div className="empty-panel">
                Belum ada data penjualan.
              </div>

            ) : (

              <div className="sales-chart">

                {chart
                  .slice(-12)
                  .map(
                    (item) => (

                      <div
                        className="chart-column"
                        key={
                          item.key
                        }
                      >

                        <div className="chart-value">
                          {formatRupiah(
                            item.sales
                          )}
                        </div>

                        <div className="chart-bar-area">

                          <div
                            className="chart-bar"
                            style={{
                              height:
                                `${
                                  Math.max(
                                    5,
                                    (
                                      Number(
                                        item.sales
                                      ) /
                                      maxSales
                                    ) *
                                      100
                                  )
                                }%`,
                            }}
                          />

                        </div>

                        <span>
                          {
                            item.label
                          }
                        </span>

                      </div>

                    )
                  )}

              </div>

            )}

          </section>


          <div className="report-columns">


            <section className="panel">

              <div className="panel-header">

                <div>

                  <h3>
                    Produk Terlaris
                  </h3>

                  <p>
                    Berdasarkan quantity
                  </p>

                </div>

              </div>


              {productChart.length ===
              0 ? (

                <div className="empty-panel">
                  Belum ada data.
                </div>

              ) : (

                <div className="report-product-list">

                  {productChart
                    .slice(0, 8)
                    .map(
                      (
                        item,
                        index
                      ) => (

                        <div
                          className="report-product"
                          key={
                            item.product_id
                          }
                        >

                          <div className="report-rank">
                            {index + 1}
                          </div>

                          <div className="report-product-main">

                            <div className="report-product-title">

                              <strong>
                                {
                                  item.product_name
                                }
                              </strong>

                              <span>
                                {
                                  item.quantity
                                }{" "}
                                unit
                              </span>

                            </div>

                            <div className="progress-track">

                              <div
                                className="progress-fill"
                                style={{
                                  width:
                                    `${
                                      (
                                        Number(
                                          item.quantity
                                        ) /
                                        maxProduct
                                      ) *
                                      100
                                    }%`,
                                }}
                              />

                            </div>

                          </div>

                        </div>

                      )
                    )}

                </div>

              )}

            </section>


            <section className="panel">

              <div className="panel-header">

                <div>

                  <h3>
                    Insight
                  </h3>

                  <p>
                    Ringkasan laporan
                  </p>

                </div>

              </div>


              <div className="insight-list">

                <div className="insight-item">

                  <span>
                    Data periode
                  </span>

                  <strong>
                    {period ===
                    "monthly"
                      ? "Bulanan"
                      : "Harian"}
                  </strong>

                </div>


                <div className="insight-item">

                  <span>
                    Jumlah periode
                  </span>

                  <strong>
                    {chart.length}
                  </strong>

                </div>


                <div className="insight-item">

                  <span>
                    Produk terdata
                  </span>

                  <strong>
                    {productChart.length}
                  </strong>

                </div>

              </div>

            </section>

          </div>

        </>

      )}

    </div>
  );
}


/* =====================================================
   PREDICTION
   ===================================================== */

function PredictionPage({
  predictions,
  loading,
  formatRupiah,
}) {

  const critical =
    predictions.filter(
      (item) =>
        item.stock_status ===
        "Kritis"
    );

  const restock =
    predictions.filter(
      (item) =>
        item.stock_status ===
        "Perlu Restock"
    );

  return (
    <div className="page-content">

      <div className="ml-banner">

        <div className="ml-banner-icon">
          ML
        </div>

        <div>

          <span>
            MACHINE LEARNING
          </span>

          <h2>
            Prediksi Penjualan & Restock
          </h2>

          <p>
            Sistem menggunakan Linear Regression
            berdasarkan data penjualan historis.
          </p>

        </div>

      </div>


      <div className="prediction-summary">

        <div>

          <span>
            Total Model
          </span>

          <strong>
            {predictions.length}
          </strong>

        </div>


        <div>

          <span>
            Perlu Restock
          </span>

          <strong>
            {
              restock.length
            }
          </strong>

        </div>


        <div>

          <span>
            Kritis
          </span>

          <strong className="danger-text">
            {
              critical.length
            }
          </strong>

        </div>

      </div>


      {loading ? (

        <div className="loading-box">
          Menghitung prediksi ML...
        </div>

      ) : predictions.length ===
      0 ? (

        <div className="empty-panel">
          Data prediksi belum tersedia.
        </div>

      ) : (

        <div className="prediction-grid-new">

          {predictions.map(
            (prediction) => (

              <div
                className="prediction-card-new"
                key={
                  prediction.product_id
                }
              >

                <div className="prediction-card-head">

                  <div className="prediction-product-icon">
                    📈
                  </div>

                  <div>

                    <h3>
                      {
                        prediction.product_name
                      }
                    </h3>

                    <span>
                      {
                        prediction.model
                      }
                    </span>

                  </div>

                </div>


                <div className="prediction-main">

                  <div>

                    <span>
                      Prediksi berikutnya
                    </span>

                    <strong>
                      {
                        prediction.predicted_sales
                      }
                    </strong>

                    <small>
                      unit
                    </small>

                  </div>

                  <div className="prediction-trend">

                    <span>
                      Tren
                    </span>

                    <strong>
                      {
                        prediction.trend ===
                        "Naik"
                          ? "↑ Naik"
                          : prediction.trend ===
                            "Turun"
                          ? "↓ Turun"
                          : "→ Stabil"
                      }
                    </strong>

                  </div>

                </div>


                <div className="prediction-data-grid">

                  <div>

                    <span>
                      Stok sekarang
                    </span>

                    <strong>
                      {
                        prediction.current_stock
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      Rata-rata
                    </span>

                    <strong>
                      {
                        prediction.average_sales
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      Training
                    </span>

                    <strong>
                      {
                        prediction.training_data_count
                      }{" "}
                      hari
                    </strong>

                  </div>

                </div>


                <div
                  className={`prediction-status ${
                    prediction.stock_status ===
                    "Kritis"
                      ? "critical"
                      : prediction.stock_status ===
                        "Perlu Restock"
                      ? "need-restock"
                      : "safe"
                  }`}
                >

                  <div>

                    <strong>
                      {prediction.stock_status}
                    </strong>

                    <span>
                      Status persediaan
                    </span>

                  </div>


                  <div className="restock-value">

                    {prediction.restock_quantity >
                    0
                      ? `+${prediction.restock_quantity} unit`
                      : "Tidak perlu"}

                  </div>

                </div>


                {prediction.restock_quantity >
                  0 && (

                  <div className="restock-message">

                    💡 Rekomendasi restock:

                    <strong>
                      {" "}
                      {
                        prediction.restock_quantity
                      }{" "}
                      unit
                    </strong>

                  </div>

                )}

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}
