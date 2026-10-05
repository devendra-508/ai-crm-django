import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";

import api from "../api";

// ======================================================
// DEFAULT FORM
// ======================================================

const emptyCustomer = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  customer_type: "Regular",
};

// ======================================================
// CUSTOMERS COMPONENT
// ======================================================

function Customers() {
  // --------------------------------------------------
  // Customers
  // --------------------------------------------------

  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // --------------------------------------------------
  // Form
  // --------------------------------------------------

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState(emptyCustomer);

  const [formLoading, setFormLoading] = useState(false);

  const [formError, setFormError] = useState("");

  // null = Add
  // customer object = Edit
  const [editingCustomer, setEditingCustomer] = useState(null);

  // ==================================================
  // GET CUSTOMERS
  // ==================================================

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/customers/");

      setCustomers(response.data);
    } catch (err) {
      console.error(err);

      setError("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LOAD CUSTOMERS WHEN PAGE OPENS
  // ==================================================

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ==================================================
  // SEARCH
  // ==================================================

  const filteredCustomers = customers.filter((customer) => {
    const text = `
            ${customer.name}
            ${customer.phone}
            ${customer.email || ""}
        `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  // ==================================================
  // INPUT CHANGE
  // ==================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // ==================================================
  // OPEN ADD FORM
  // ==================================================

  const openAddForm = () => {
    setEditingCustomer(null);

    setFormData(emptyCustomer);

    setFormError("");

    setShowForm(true);
  };

  // ==================================================
  // OPEN EDIT FORM
  // ==================================================

  const openEditForm = (customer) => {
    setEditingCustomer(customer);

    setFormData({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      city: customer.city || "",
      customer_type: customer.customer_type || "Regular",
    });

    setFormError("");

    setShowForm(true);
  };

  // ==================================================
  // CLOSE FORM
  // ==================================================

  const closeForm = () => {
    if (formLoading) {
      return;
    }

    setShowForm(false);

    setEditingCustomer(null);

    setFormData(emptyCustomer);

    setFormError("");
  };

  // ==================================================
  // SAVE CUSTOMER
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormLoading(true);

    setFormError("");

    try {
      // ------------------------------------------
      // EDIT CUSTOMER
      // ------------------------------------------

      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}/`, formData);
      }

      // ------------------------------------------
      // ADD CUSTOMER
      // ------------------------------------------
      else {
        await api.post("/customers/", formData);
      }

      // Close form
      closeForm();

      // Refresh list
      await fetchCustomers();
    } catch (err) {
      console.error(err);

      const backendError = err.response?.data;

      if (backendError) {
        const firstError = Object.values(backendError)[0];

        setFormError(
          Array.isArray(firstError) ? firstError[0] : String(firstError),
        );
      } else {
        setFormError(
          editingCustomer
            ? "Failed to update customer."
            : "Failed to add customer.",
        );
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (customer) => {
    const confirmDelete = window.confirm(
        `Are you sure you want to delete "${customer.name}"?`
    );

    if (!confirmDelete) {
        return;
    }

    try {
        await api.delete(`/customers/${customer.id}/`);

        await fetchCustomers();

    } catch (err) {
        console.error("Delete Customer Error:", err);

        const message =
            err.response?.data?.detail ||
            "Failed to delete customer.";

        alert(message);
    }
};

  

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="space-y-6">
      {/* ==================================================
                HEADER
            ================================================== */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage your CRM customers
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {/* ==================================================
                SEARCH
            ================================================== */}

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ==================================================
                ERROR
            ================================================== */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* ==================================================
                CUSTOMER TABLE
            ================================================== */}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">
            Loading customers...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* TABLE HEADER */}

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-4 text-left">Name</th>

                  <th className="px-5 py-4 text-left">Phone</th>

                  <th className="px-5 py-4 text-left">Email</th>

                  <th className="px-5 py-4 text-left">City</th>

                  <th className="px-5 py-4 text-left">Type</th>

                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              {/* TABLE BODY */}

              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-medium">{customer.name}</td>

                      <td className="px-5 py-4 text-slate-600">
                        {customer.phone}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {customer.email || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {customer.city || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs">
                          {customer.customer_type}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {/* EDIT */}

                          <button
                            onClick={() => openEditForm(customer)}
                            title="Edit customer"
                            className="p-2 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600"
                          >
                            <Pencil size={17} />
                          </button>

                          {/* DELETE */}

                          <button
                            title="Delete customer"
                            onClick={() => handleDelete(customer)}
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-10 text-center text-slate-400"
                    >
                      {search
                        ? "No customers found."
                        : "No customers available."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================================================
    ADD / EDIT CUSTOMER MODAL
================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* =========================
                MODAL HEADER
            ========================= */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {editingCustomer ? "Edit Customer" : "Add Customer"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {editingCustomer
                    ? "Update customer information"
                    : "Create a new CRM customer"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={formLoading}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* =========================
                FORM
            ========================= */}

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* NAME */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Customer Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter customer name"
                    required
                    className="w-full h-11 px-3.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* PHONE */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                    maxLength="15"
                    className="w-full h-11 px-3.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="customer@example.com"
                    className="w-full h-11 px-3.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* CITY */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    className="w-full h-11 px-3.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* CUSTOMER TYPE */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Customer Type
                  </label>

                  <select
                    name="customer_type"
                    value={formData.customer_type}
                    onChange={handleChange}
                    className="w-full h-11 px-3.5 border border-slate-300 rounded-lg bg-white text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Regular">Regular</option>

                    <option value="Wholesale">Wholesale</option>

                    <option value="VIP">VIP</option>
                  </select>
                </div>

                {/* ADDRESS */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Address
                  </label>

                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                    className="w-full h-11 px-3.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* =========================
                    ERROR
                ========================= */}

              {formError && (
                <div className="mt-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {formError}
                </div>
              )}

              {/* =========================
                    FOOTER
                ========================= */}

              <div className="flex items-center justify-end gap-3 mt-7 pt-5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={formLoading}
                  className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:bg-blue-400"
                >
                  {formLoading
                    ? "Saving..."
                    : editingCustomer
                      ? "Update Customer"
                      : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ======================================================
// EXPORT
// ======================================================

export default Customers;
