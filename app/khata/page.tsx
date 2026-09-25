"use client";

import { useEffect, useState } from "react";

type Customer = {
  id: number;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  photo?: string;
  due: number;
  createdAt: string;
};

export default function KhataPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");
  const [due, setDue] = useState(0);

  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedCustomers: Customer[] = JSON.parse(
      localStorage.getItem("hisabpro_customers") || "[]"
    );

    setCustomers(savedCustomers);
  }, []);

  function goToDashboard() {
    window.location.href = "/hisabpro/";
  }

  function goToCustomer(customerId: number) {
    window.location.href =
      `/hisabpro/khata/customer/?id=${customerId}`;
  }

  function handlePhotoChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage("Photo size 2MB se kam honi chahiye.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPhoto(reader.result as string);
      setMessage("");
    };

    reader.readAsDataURL(file);
  }

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
      address: address.trim(),
      email: email.trim(),
      photo,
      due: Math.max(0, due),
      createdAt: new Date().toISOString(),
    };

    const updatedCustomers = [
      ...customers,
      customer,
    ];

    setCustomers(updatedCustomers);

    localStorage.setItem(
      "hisabpro_customers",
      JSON.stringify(updatedCustomers)
    );

    setName("");
    setPhone("");
    setAddress("");
    setEmail("");
    setPhoto("");
    setDue(0);

    setMessage("Customer added successfully ✅");
  }

  function deleteCustomer(id: number) {
    const customer = customers.find(
      (item) => item.id === id
    );

    if (!customer) return;

    const confirmed = window.confirm(
      `Delete ${customer.name}?`
    );

    if (!confirmed) return;

    const updatedCustomers = customers.filter(
      (item) => item.id !== id
    );

    setCustomers(updatedCustomers);

    localStorage.setItem(
      "hisabpro_customers",
      JSON.stringify(updatedCustomers)
    );

    setMessage("Customer deleted.");
  }

  const totalDue = customers.reduce(
    (sum, customer) =>
      sum + Number(customer.due || 0),
    0
  );

  return (
    <main className="khata-page">

      {/* HEADER */}

      <header className="khata-header">

        <button
          type="button"
          onClick={goToDashboard}
          className="back-button"
        >
          ← Back
        </button>

        <h1>
          Khata
        </h1>

        <span></span>

      </header>

      {/* STATS */}

      <section className="khata-stats">

        <div>
          <span>
            Total Customers
          </span>

          <strong>
            {customers.length}
          </strong>
        </div>

        <div>
          <span>
            Total Due
          </span>

          <strong>
            ₹{totalDue.toLocaleString("en-IN")}
          </strong>
        </div>

      </section>

      {/* ADD CUSTOMER */}

      <section className="customer-form">

        <h2>
          Add Customer
        </h2>

        {/* PHOTO */}

        <div className="customer-photo-upload">

          <div className="customer-photo-preview">

            {photo ? (
              <img
                src={photo}
                alt="Customer"
              />
            ) : (
              <span>
                👤
              </span>
            )}

          </div>

          <div className="photo-upload-content">

            <strong>
              Profile Photo
            </strong>

            <small>
              JPG, PNG or WEBP • Max 2MB
            </small>

            <label className="photo-upload-button">

              Choose Photo

              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />

            </label>

            {photo && (
              <button
                type="button"
                className="remove-photo-button"
                onClick={() =>
                  setPhoto("")
                }
              >
                Remove Photo
              </button>
            )}

          </div>

        </div>

        {/* NAME */}

        <label>
          Customer Name
        </label>

        <input
          type="text"
          placeholder="Example: Rahul Kumar"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        {/* PHONE */}

        <label>
          Mobile Number
        </label>

        <input
          type="tel"
          placeholder="Example: 9876543XXX"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
        />

        {/* ADDRESS */}

        <label>
          Address
        </label>

        <textarea
          placeholder="Customer address"
          value={address}
          onChange={(e) =>
            setAddress(e.target.value)
          }
          rows={3}
        />

        {/* EMAIL */}

        <label>
          Email
        </label>

        <input
          type="email"
          placeholder="Example: customer@email.com"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        {/* OPENING DUE */}

        <label>
          Opening Due
        </label>

        <input
          type="number"
          min="0"
          value={due}
          onChange={(e) =>
            setDue(
              Math.max(
                0,
                Number(e.target.value)
              )
            )
          }
        />

        <button
          type="button"
          onClick={addCustomer}
        >
          + Add Customer
        </button>

        {message && (
          <p className="khata-message">
            {message}
          </p>
        )}

      </section>

      {/* CUSTOMER LIST */}

      <section className="customer-list">

        <div className="customer-list-title">

          <h2>
            Customers
          </h2>

        </div>

        {customers.length === 0 ? (

          <div className="empty-customers">

            <div>
              👤
            </div>

            <h3>
              No Customers Yet
            </h3>

            <p>
              Add your first customer
              to start Khata.
            </p>

          </div>

        ) : (

          customers.map((customer) => (

            <div
              className="customer-item"
              key={customer.id}
            >

              {/* CUSTOMER PHOTO */}

              <div className="customer-icon">

                {customer.photo ? (

                  <img
                    src={customer.photo}
                    alt={customer.name}
                  />

                ) : (

                  <span>
                    {customer.name
                      .charAt(0)
                      .toUpperCase()}
                  </span>

                )}

              </div>

              {/* CUSTOMER INFO */}

              <div className="customer-info">

                <strong>
                  {customer.name}
                </strong>

                <span>
                  {customer.phone}
                </span>

                {customer.address && (
                  <span>
                    {customer.address}
                  </span>
                )}

                <small>
                  Added{" "}
                  {new Date(
                    customer.createdAt
                  ).toLocaleDateString(
                    "en-IN"
                  )}
                </small>

              </div>

              {/* RIGHT SIDE */}

              <div className="customer-right">

                <strong>
                  ₹
                  {Number(
                    customer.due || 0
                  ).toLocaleString("en-IN")}
                </strong>

                <span>
                  {Number(customer.due || 0) > 0
                    ? "Due"
                    : "No Due"}
                </span>

                <div className="customer-actions">

                  <button
                    type="button"
                    className="view-customer"
                    onClick={() =>
                      goToCustomer(
                        customer.id
                      )
                    }
                  >
                    View
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteCustomer(
                        customer.id
                      )
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
