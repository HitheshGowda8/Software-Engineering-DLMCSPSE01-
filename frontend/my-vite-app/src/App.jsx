import { useEffect, useState } from "react";
import API from "./services/api";

function App() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);

  const [report, setReport] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalItemsSold: 0,
  });

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    price: "",
    supplier: "",
    lowStockLimit: "",
  });

  const [saleData, setSaleData] = useState({
    productId: "",
    quantitySold: "",
  });

  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    const res = await API.get("/products");
    setProducts(res.data);
  };

  const fetchSales = async () => {
    const res = await API.get("/sales");
    setSales(res.data);
  };

  const fetchReport = async () => {
    const res = await API.get("/sales/report");
    setReport(res.data);
  };

  useEffect(() => {
    fetchProducts();
    fetchSales();
    fetchReport();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaleChange = (e) => {
    setSaleData({ ...saleData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      quantity: "",
      price: "",
      supplier: "",
      lowStockLimit: "",
    });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      ...formData,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      lowStockLimit: Number(formData.lowStockLimit),
    };

    if (editId) {
      await API.put(`/products/${editId}`, productData);
      alert("Product updated successfully");
    } else {
      await API.post("/products", productData);
      alert("Product added successfully");
    }

    resetForm();
    fetchProducts();
  };

  const handleEdit = (product) => {
    setEditId(product._id);
    setFormData({
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      price: product.price,
      supplier: product.supplier || "",
      lowStockLimit: product.lowStockLimit,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await API.delete(`/products/${id}`);
    fetchProducts();
  };

  const handleSaleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/sales", {
        productId: saleData.productId,
        quantitySold: Number(saleData.quantitySold),
      });

      alert("Sale recorded successfully");

      setSaleData({
        productId: "",
        quantitySold: "",
      });

      fetchProducts();
      fetchSales();
      fetchReport();
    } catch (error) {
      alert(error.response?.data?.message || "Error recording sale");
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = products.filter(
    (item) => item.quantity <= item.lowStockLimit
  ).length;

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Smart Inventory</h2>
        <p>Retail Management System</p>

        <nav>
          <a href="#dashboard">Dashboard</a>
          <a href="#products">Products</a>
          <a href="#add-product">Add Product</a>
          <a href="#sales">Sales</a>
        </nav>
      </aside>

      <main className="main">
        <section className="hero">
          <h1>Inventory Dashboard</h1>
          <p>Manage products, stock levels, sales, suppliers, and reports.</p>
        </section>

        <section className="cards" id="dashboard">
          <div className="card">
            <h3>Total Products</h3>
            <h2>{totalProducts}</h2>
          </div>

          <div className="card">
            <h3>Total Stock</h3>
            <h2>{totalStock}</h2>
          </div>

          <div className="card warning">
            <h3>Low Stock Items</h3>
            <h2>{lowStockItems}</h2>
          </div>

          <div className="card">
            <h3>Total Sales</h3>
            <h2>{report.totalSales}</h2>
          </div>

          <div className="card">
            <h3>Items Sold</h3>
            <h2>{report.totalItemsSold}</h2>
          </div>

          <div className="card">
            <h3>Total Revenue</h3>
            <h2>Rs. {report.totalRevenue}</h2>
          </div>
        </section>

        <section className="content-grid">
          <div className="form-card" id="add-product">
            <h2>{editId ? "Update Product" : "Add New Product"}</h2>

            <form onSubmit={handleSubmit}>
              <input name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required />
              <input name="category" placeholder="Category" value={formData.category} onChange={handleChange} required />
              <input type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={handleChange} required />
              <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required />
              <input name="supplier" placeholder="Supplier Name" value={formData.supplier} onChange={handleChange} />
              <input type="number" name="lowStockLimit" placeholder="Low Stock Limit" value={formData.lowStockLimit} onChange={handleChange} required />

              <button type="submit">{editId ? "Update Product" : "Add Product"}</button>

              {editId && (
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          <div className="table-card" id="products">
            <div className="table-header">
              <h2>Product List</h2>
              <input placeholder="Search product..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Supplier</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{product.quantity}</td>
                      <td>Rs. {product.price}</td>
                      <td>{product.supplier || "N/A"}</td>
                      <td>
                        {product.quantity <= product.lowStockLimit ? (
                          <span className="badge danger">Low Stock</span>
                        ) : (
                          <span className="badge success">Available</span>
                        )}
                      </td>
                      <td>
                        <button className="edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(product._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="7" className="empty">No products found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="sales-section" id="sales">
          <div className="form-card">
            <h2>Record Sale</h2>

            <form onSubmit={handleSaleSubmit}>
              <select name="productId" value={saleData.productId} onChange={handleSaleChange} required>
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} - Stock: {product.quantity}
                  </option>
                ))}
              </select>

              <input
                type="number"
                name="quantitySold"
                placeholder="Quantity Sold"
                value={saleData.quantitySold}
                onChange={handleSaleChange}
                required
              />

              <button type="submit">Record Sale</button>
            </form>
          </div>

          <div className="table-card">
            <h2>Sales Report</h2>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity Sold</th>
                    <th>Total Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale._id}>
                      <td>{sale.productName}</td>
                      <td>{sale.quantitySold}</td>
                      <td>Rs. {sale.totalAmount}</td>
                      <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}

                  {sales.length === 0 && (
                    <tr>
                      <td colSpan="4" className="empty">No sales recorded</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;