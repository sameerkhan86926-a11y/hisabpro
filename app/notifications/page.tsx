"use client";

import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  stock: number;
};

type Customer = {
  id: number;
  name: string;
  due: number;
};

type Notification = {
  id: string;
  type: "danger" | "warning" | "info";
  icon: string;
  title: string;
  message: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  function loadNotifications() {
    const newNotifications: Notification[] = [];

    try {
      const products: Product[] = JSON.parse(
        localStorage.getItem("hisabpro_products") || "[]"
      );

      const customers: Customer[] = JSON.parse(
        localStorage.getItem("hisabpro_customers") || "[]"
      );

      // OUT OF STOCK
      products
        .filter((product) => Number(product.stock) <= 0)
        .forEach((product) => {
          newNotifications.push({
            id: `out-${product.id}`,
            type: "danger",
            icon: "📦",
            title: "Out of Stock",
            message: `${product.name} is completely out of stock.`,
          });
        });

      // LOW STOCK
      products
        .filter(
          (product) =>
            Number(product.stock) > 0 &&
            Number(product.stock) <= 5
        )
        .forEach((product) => {
          newNotifications.push({
            id: `low-${product.id}`,
            type: "warning",
            icon: "⚠️",
            title: "Low Stock",
            message: `${product.name} has only ${product.stock} item${
              Number(product.stock) === 1 ? "" : "s"
            } left.`,
          });
        });

      // CUSTOMER DUE
      customers
        .filter((customer) => Number(customer.due) > 0)
        .forEach((customer) => {
          newNotifications.push({
            id: `due-${customer.id}`,
            type: "info",
            icon: "💰",
            title: "Payment Due",
            message: `${customer.name} has ₹${Number(
              customer.due
            ).toLocaleString("en-IN")} pending.`,
          });
        });
    } catch (error) {
      console.error(
        "Notification loading error:",
        error
      );
    }

    setNotifications(newNotifications);
  }

  return (
    <main className="notifications-page">

      {/* HEADER */}
      <header className="notifications-header">
        <button
          onClick={() => window.history.back()}
          className="back-button"
        >
          ← Back
        </button>

        <h1>Notifications</h1>

        <span></span>
      </header>

      {/* CONTENT */}
      <section className="notifications-content">

        <div className="notifications-title">
          <div>
            <h2>Business Alerts</h2>
            <p>
              Important updates about your business
            </p>
          </div>

          <button
            className="refresh-notifications"
            onClick={loadNotifications}
          >
            ↻
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="notifications-empty">
            <div className="empty-icon">🔔</div>

            <h3>All caught up!</h3>

            <p>
              There are no important business alerts
              right now.
            </p>
          </div>
        ) : (
          <div className="notification-list">

            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${notification.type}`}
              >
                <div className="notification-item-icon">
                  {notification.icon}
                </div>

                <div className="notification-item-content">
                  <strong>
                    {notification.title}
                  </strong>

                  <p>
                    {notification.message}
                  </p>
                </div>
              </div>
            ))}

          </div>
        )}

      </section>
    </main>
  );
}
