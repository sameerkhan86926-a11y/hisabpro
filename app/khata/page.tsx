"use client";

import { useEffect, useState } from "react";

type Customer = {
  id: number;
  name: string;
  phone: string;
  due: number;
  createdAt: string;
};

export default function KhataPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [due, setDue] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedCustomers = JSON.parse(
      localStorage.getItem("hisabpro_customers") || "[]"
    );

    setCustomers(savedCustomers);
  }, []);

  function addCustomer() {
    if (!name.trim()) {
      setMessage("Customer name required.");
      return;
    }

    if (!phone.trim()) {
      setMessage("Mobile number required.");
      return;
    }

    const customer: Customer = {
      id: Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      due: Math.max(0, due),
      createdAt: new Date().toISOString(),
    };

    const updatedCustomers = [...customers, customer];

    setCustomers(updatedCustomers);

    localStorage.setItem(
      "hisabpro_customers",
      JSON.stringify(updatedCustomers)
    );

    setName("");
    setPhone("");
    setDue(0);

    setMessage("Customer added successfully ✅");
  }

  function deleteCustomer(id: number) {
    const updatedCustomers = customers.filter(
      (customer) => customer.id !== id
    );

    setCustomers(updatedCustomers);

    localStorage.setItem(
      "hisabpro_customers",
      JSON.stringify(updatedCustomers)
    );
  }

  const totalDue = customers.reduce(
    (sum, customer) => sum + customer.due,
    0
  );

  return (
    <main className="khata-page">

      <header className="khata-header">
        <a href="/hisabpro/">
          ← Dashboard
        </a>

        <h1>Khata</h1>

        <span></span>
      </header>

      <section className="khata-stats">

        <div>
          <span>Total Customers</span>
          <strong>{customers.length}</strong>
        </div>

        <div>
          <span>Total Due</span>

          <strong>
            ₹{totalDue.toLocaleString("en-IN")}
          </strong>
        </div>

      </section>

      <section className="customer-form">

        <h2>Add Customer</h2>

        <label>Customer Name</label>

        <input
          type="text"
          placeholder="Example: Rahul Kumar"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label>Mobile Number</label>

        <input
          type="tel"
          placeholder="Example: 9876543210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <label>Opening Due</label>

        <input
          type="number"
          min="0"
          value={due}
          onChange={(e) =>
            setDue(Math.max(0, Number(e.target.value)))
          }
        />

        <button onClick={addCustomer}>
          + Add Customer
        </button>

        {message && (
          <p className="khata-message">
            {message}
          </p>
        )}

      </section>

      <section className="customer-list">

        <div className="customer-list-title">
          <h2>Customers</h2>
        </div>

        {customers.length === 0 ? (
          <div className="empty-customers">

            <div>👤</div>

            <h3>No Customers Yet</h3>

            <p>
              Add your first customer to start Khata.
            </p>

          </div>
        ) : (
          customers.map((customer) => (

            <div
              className="customer-item"
              key={customer.id}
            >

              <div className="customer-icon">
                👤
              </div>

              <div className="customer-info">

                <strong>
                  {customer.name}
                </strong>

                <span>
                  {customer.phone}
                </span>

                <small>
                  Added{" "}
                  {new Date(
                    customer.createdAt
                  ).toLocaleDateString("en-IN")}
                </small>

              </div>

              <div className="customer-right">

                <strong>
                  ₹{customer.due.toLocaleString("en-IN")}
                </strong>

                <span>
                  {customer.due > 0
                    ? "Due"
                    : "No Due"}
                </span>

                <div className="customer-actions">

                  <a
                    href={`/hisabpro/khata/customer/?id=${customer.id}`}
                    className="view-customer"
                  >
                    View
                  </a>

                  <button
                    onClick={() =>
                      deleteCustomer(customer.id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            </div>

          ))
        )}

      </section>

    </main>
  );
}
