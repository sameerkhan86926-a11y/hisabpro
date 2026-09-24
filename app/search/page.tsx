"use client";

import {
  useEffect,
  useState,
} from "react";

type Product = {
  id: number;
  name: string;
  category?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  stock?: number;
};

type Customer = {
  id: number;
  name: string;
  phone?: string;
  due?: number;
};

type SaleItem = {
  productId?: number;
  product?: string;
  quantity?: number;
  price?: number;
  amount?: number;
};

type Sale = {
  id: number;
  items?: SaleItem[];
  total?: number;
  date?: string;
  paymentType?: "cash" | "credit";
  customerName?: string;
};

type SearchResult = {
  id: string;
  type: "Product" | "Customer" | "Sale";
  title: string;
  subtitle: string;
  amount?: string;
  href: string;
};

export default function SearchPage() {
  const [query, setQuery] =
    useState("");

  const [results, setResults] =
    useState<SearchResult[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [sales, setSales] =
    useState<Sale[]>([]);

  useEffect(() => {
    try {
      const savedProducts =
        JSON.parse(
          localStorage.getItem(
            "hisabpro_products"
          ) || "[]"
        );

      const savedCustomers =
        JSON.parse(
          localStorage.getItem(
            "hisabpro_customers"
          ) || "[]"
        );

      const savedSales =
        JSON.parse(
          localStorage.getItem(
            "hisabpro_sales"
          ) || "[]"
        );

      setProducts(
        Array.isArray(savedProducts)
          ? savedProducts
          : []
      );

      setCustomers(
        Array.isArray(savedCustomers)
          ? savedCustomers
          : []
      );

      setSales(
        Array.isArray(savedSales)
          ? savedSales
          : []
      );
    } catch {
      setProducts([]);
      setCustomers([]);
      setSales([]);
    }
  }, []);

  useEffect(() => {
    const search =
      query.trim().toLowerCase();

    if (!search) {
      setResults([]);
      return;
    }

    const found: SearchResult[] = [];

    products.forEach(
      (product) => {
        const text =
          `${product.name} ${
            product.category || ""
          }`.toLowerCase();

        if (text.includes(search)) {
          found.push({
            id: `product-${product.id}`,
            type: "Product",
            title: product.name,
            subtitle:
              product.category ||
              "Product",
            amount:
              `Stock: ${
                product.stock || 0
              }`,
            href:
              "/hisabpro/stock/",
          });
        }
      }
    );

    customers.forEach(
      (customer) => {
        const text =
          `${customer.name} ${
            customer.phone || ""
          }`.toLowerCase();

        if (text.includes(search)) {
          found.push({
            id: `customer-${customer.id}`,
            type: "Customer",
            title: customer.name,
            subtitle:
              customer.phone ||
              "Customer",
            amount:
              `Due: ₹${Number(
                customer.due || 0
              ).toFixed(2)}`,
            href:
              "/hisabpro/khata/",
          });
        }
      }
    );

    sales.forEach(
      (sale) => {
        const productNames =
          sale.items
            ?.map(
              (item) =>
                item.product || ""
            )
            .join(" ") || "";

        const text =
          `${productNames} ${
            sale.customerName ||
            ""
          } ${sale.id}`.toLowerCase();

        if (text.includes(search)) {
          found.push({
            id: `sale-${sale.id}`,
            type: "Sale",
            title:
              `Sale #${String(
                sale.id
              ).slice(-6)}`,
            subtitle:
              sale.customerName ||
              "Cash Sale",
            amount:
              `₹${Number(
                sale.total || 0
              ).toFixed(2)}`,
            href:
              "/hisabpro/sales/history/",
          });
        }
      }
    );

    setResults(found);
  }, [
    query,
    products,
    customers,
    sales,
  ]);

  return (
    <main className="search-page">

      <header className="search-header">

        <button
          type="button"
          onClick={() =>
            window.history.back()
          }
          className="back-button"
        >
          ←
        </button>

        <div>
          <h1>Search</h1>
          <p>
            Find products, customers
            and sales
          </p>
        </div>

      </header>

      <section className="search-box">

        <div className="search-input-wrap">

          <span>🔎</span>

          <input
            type="search"
            value={query}
            onChange={(e) =>
              setQuery(
                e.target.value
              )
            }
            placeholder="Search product, customer, sale..."
            autoFocus
          />

          {query && (
            <button
              type="button"
              onClick={() =>
                setQuery("")
              }
              className="search-clear"
            >
              ×
            </button>
          )}

        </div>

      </section>

      {!query.trim() && (
        <section className="search-empty">

          <div className="search-empty-icon">
            🔎
          </div>

          <h2>
            Search HisabPro
          </h2>

          <p>
            Product, customer ya sale
            ka naam type karein.
          </p>

        </section>
      )}

      {query.trim() &&
        results.length === 0 && (
          <section className="search-empty">

            <div className="search-empty-icon">
              😕
            </div>

            <h2>
              No results found
            </h2>

            <p>
              "{query}" ke liye kuch
              nahi mila.
            </p>

          </section>
        )}

      {results.length > 0 && (
        <section className="search-results">

          <div className="search-results-title">
            <h2>
              Search Results
            </h2>

            <span>
              {results.length}
            </span>
          </div>

          <div className="search-result-list">

            {results.map(
              (result) => (
                <a
                  key={result.id}
                  href={result.href}
                  className="search-result-card"
                >

                  <div className="search-result-icon">
                    {result.type ===
                    "Product"
                      ? "📦"
                      : result.type ===
                        "Customer"
                      ? "👤"
                      : "🧾"}
                  </div>

                  <div className="search-result-content">

                    <strong>
                      {result.title}
                    </strong>

                    <small>
                      {result.type} •{" "}
                      {result.subtitle}
                    </small>

                    {result.amount && (
                      <span>
                        {result.amount}
                      </span>
                    )}

                  </div>

                  <div className="search-result-arrow">
                    →
                  </div>

                </a>
              )
            )}

          </div>

        </section>
      )}

    </main>
  );
}
