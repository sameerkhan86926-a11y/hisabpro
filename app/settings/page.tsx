"use client";

import { useEffect, useState } from "react";

type Business = {
  id: number;
  businessName: string;
  ownerName: string;
  phone: string;
  address: string;
  gstin: string;
  email: string;
};

const emptyBusiness: Omit<Business, "id"> = {
  businessName: "",
  ownerName: "",
  phone: "",
  address: "",
  gstin: "",
  email: "",
};

export default function SettingsPage() {
  const [businesses, setBusinesses] =
    useState<Business[]>([]);

  const [activeBusinessId, setActiveBusinessId] =
    useState<number | null>(null);

  const [business, setBusiness] =
    useState<Omit<Business, "id">>(
      emptyBusiness
    );

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [message, setMessage] =
    useState("");

  /* =========================
     SECURITY / APP LOCK
  ========================= */

  const [appLockEnabled, setAppLockEnabled] =
    useState(false);

  const [appPin, setAppPin] =
    useState("");

  const [confirmPin, setConfirmPin] =
    useState("");

  const [pinLength, setPinLength] =
    useState("4");

  const [autoLock, setAutoLock] =
    useState("immediately");

  const [securityMessage, setSecurityMessage] =
    useState("");

  useEffect(() => {
    loadBusinesses();
    loadSecuritySettings();
  }, []);

  function loadBusinesses() {
    const saved =
      localStorage.getItem(
        "hisabpro_businesses"
      );

    const oldSaved =
      localStorage.getItem(
        "hisabpro_business"
      );

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setBusinesses(parsed);
        }
      } catch {
        console.log(
          "Business data could not be loaded."
        );
      }
    } else if (oldSaved) {
      try {
        const oldBusiness =
          JSON.parse(oldSaved);

        const migratedBusiness: Business = {
          id: Date.now(),
          businessName:
            oldBusiness.businessName || "",
          ownerName:
            oldBusiness.ownerName || "",
          phone:
            oldBusiness.phone || "",
          address:
            oldBusiness.address || "",
          gstin:
            oldBusiness.gstin || "",
          email:
            oldBusiness.email || "",
        };

        setBusinesses([
          migratedBusiness,
        ]);

        setActiveBusinessId(
          migratedBusiness.id
        );

        localStorage.setItem(
          "hisabpro_businesses",
          JSON.stringify([
            migratedBusiness,
          ])
        );

        localStorage.setItem(
          "hisabpro_active_business",
          String(
            migratedBusiness.id
          )
        );
      } catch {
        console.log(
          "Old business data could not be migrated."
        );
      }
    }

    const savedActive =
      localStorage.getItem(
        "hisabpro_active_business"
      );

    if (savedActive) {
      setActiveBusinessId(
        Number(savedActive)
      );
    }
  }

  function loadSecuritySettings() {
    const savedLock =
      localStorage.getItem(
        "hisabpro_app_lock"
      ) === "true";

    const savedPin =
      localStorage.getItem(
        "hisabpro_app_lock_pin_hash"
      );

    const savedPinLength =
      localStorage.getItem(
        "hisabpro_app_lock_pin_length"
      ) || "4";

    const savedAutoLock =
      localStorage.getItem(
        "hisabpro_app_lock_auto"
      ) || "immediately";

    setAppLockEnabled(
      savedLock
    );

    /*
     * We don't put the actual PIN
     * into the input field.
     *
     * If a PIN already exists,
     * user enters a new PIN only
     * when changing it.
     */
    setAppPin(
      savedPin ? "******" : ""
    );

    setPinLength(
      savedPinLength
    );

    setAutoLock(
      savedAutoLock
    );
  }

  function handleChange(
    field: keyof Omit<Business, "id">,
    value: string
  ) {
    setBusiness((prev) => ({
      ...prev,
      [field]: value,
    }));

    setMessage("");
  }

  function saveBusiness() {
    if (
      !business.businessName.trim() &&
      !business.ownerName.trim()
    ) {
      setMessage(
        "Please enter Business Name or Owner Name."
      );

      return;
    }

    let updatedBusinesses: Business[];

    if (editingId !== null) {
      updatedBusinesses =
        businesses.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...business,
              }
            : item
        );
    } else {
      const newBusiness: Business = {
        id: Date.now(),
        ...business,
      };

      updatedBusinesses = [
        ...businesses,
        newBusiness,
      ];

      if (businesses.length === 0) {
        setActiveBusinessId(
          newBusiness.id
        );

        localStorage.setItem(
          "hisabpro_active_business",
          String(
            newBusiness.id
          )
        );
      }
    }

    setBusinesses(
      updatedBusinesses
    );

    localStorage.setItem(
      "hisabpro_businesses",
      JSON.stringify(
        updatedBusinesses
      )
    );

    const activeId =
      activeBusinessId ??
      updatedBusinesses[0]?.id;

    const activeBusiness =
      updatedBusinesses.find(
        (item) =>
          item.id === activeId
      );

    if (activeBusiness) {
      localStorage.setItem(
        "hisabpro_business",
        JSON.stringify(
          activeBusiness
        )
      );
    }

    setBusiness(
      emptyBusiness
    );

    setEditingId(null);

    setMessage(
      editingId !== null
        ? "Business details updated successfully ✅"
        : "Business added successfully ✅"
    );
  }

  function editBusiness(
    item: Business
  ) {
    setBusiness({
      businessName:
        item.businessName,
      ownerName:
        item.ownerName,
      phone:
        item.phone,
      address:
        item.address,
      gstin:
        item.gstin,
      email:
        item.email,
    });

    setEditingId(item.id);

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function deleteBusiness(
    id: number
  ) {
    const confirmDelete =
      window.confirm(
        "Delete this business profile?"
      );

    if (!confirmDelete) {
      return;
    }

    const updatedBusinesses =
      businesses.filter(
        (item) =>
          item.id !== id
      );

    setBusinesses(
      updatedBusinesses
    );

    localStorage.setItem(
      "hisabpro_businesses",
      JSON.stringify(
        updatedBusinesses
      )
    );

    if (activeBusinessId === id) {
      const nextBusiness =
        updatedBusinesses[0];

      if (nextBusiness) {
        setActiveBusinessId(
          nextBusiness.id
        );

        localStorage.setItem(
          "hisabpro_active_business",
          String(
            nextBusiness.id
          )
        );

        localStorage.setItem(
          "hisabpro_business",
          JSON.stringify(
            nextBusiness
          )
        );
      } else {
        setActiveBusinessId(
          null
        );

        localStorage.removeItem(
          "hisabpro_active_business"
        );

        localStorage.removeItem(
          "hisabpro_business"
        );
      }
    }

    if (editingId === id) {
      setBusiness(
        emptyBusiness
      );

      setEditingId(null);
    }

    setMessage(
      "Business deleted successfully."
    );
  }

  function selectBusiness(
    id: number
  ) {
    const selected =
      businesses.find(
        (item) =>
          item.id === id
      );

    if (!selected) {
      return;
    }

    setActiveBusinessId(id);

    localStorage.setItem(
      "hisabpro_active_business",
      String(id)
    );

    localStorage.setItem(
      "hisabpro_business",
      JSON.stringify(
        selected
      )
    );

    setMessage(
      "Active business changed successfully ✅"
    );
  }

  function cancelEdit() {
    setBusiness(
      emptyBusiness
    );

    setEditingId(null);

    setMessage("");
  }

  /* =========================
     HASH PIN
  ========================= */

  async function hashPin(
    value: string
  ) {
    const data =
      new TextEncoder().encode(
        value
      );

    const hashBuffer =
      await crypto.subtle.digest(
        "SHA-256",
        data
      );

    return Array.from(
      new Uint8Array(
        hashBuffer
      )
    )
      .map((byte) =>
        byte
          .toString(16)
          .padStart(2, "0")
      )
      .join("");
  }

  /* =========================
     SAVE SECURITY
  ========================= */

  async function saveSecuritySettings() {
    setSecurityMessage("");

    if (!appLockEnabled) {
      localStorage.setItem(
        "hisabpro_app_lock",
        "false"
      );

      localStorage.removeItem(
        "hisabpro_app_lock_pin_hash"
      );

      localStorage.removeItem(
        "hisabpro_app_lock_pin_length"
      );

      localStorage.removeItem(
        "hisabpro_app_lock_auto"
      );

      window.dispatchEvent(
        new CustomEvent(
          "hisabpro-app-lock-changed"
        )
      );

      setAppPin("");
      setConfirmPin("");

      setSecurityMessage(
        "App Lock disabled successfully."
      );

      return;
    }

    /*
     * Existing PIN
     *
     * "******" means user has not
     * entered a new PIN.
     */
    if (
      appPin === "******"
    ) {
      localStorage.setItem(
        "hisabpro_app_lock",
        "true"
      );

      localStorage.setItem(
        "hisabpro_app_lock_pin_length",
        pinLength
      );

      localStorage.setItem(
        "hisabpro_app_lock_auto",
        autoLock
      );

      window.dispatchEvent(
        new CustomEvent(
          "hisabpro-app-lock-changed"
        )
      );

      setSecurityMessage(
        "Security settings updated successfully ✅"
      );

      return;
    }

    if (
      !/^\d+$/.test(appPin)
    ) {
      setSecurityMessage(
        "PIN must contain numbers only."
      );

      return;
    }

    if (
      appPin.length !==
      Number(pinLength)
    ) {
      setSecurityMessage(
        `Please enter exactly ${pinLength} digit PIN.`
      );

      return;
    }

    if (
      appPin !== confirmPin
    ) {
      setSecurityMessage(
        "PIN and Confirm PIN do not match."
      );

      return;
    }

    const hashedPin =
      await hashPin(appPin);

    localStorage.setItem(
      "hisabpro_app_lock_pin_hash",
      hashedPin
    );

    localStorage.setItem(
      "hisabpro_app_lock",
      "true"
    );

    localStorage.setItem(
      "hisabpro_app_lock_pin_length",
      pinLength
    );

    localStorage.setItem(
      "hisabpro_app_lock_auto",
      autoLock
    );

    /*
     * Tell AppLock component
     * that security settings changed.
     */
    window.dispatchEvent(
      new CustomEvent(
        "hisabpro-app-lock-changed"
      )
    );

    setAppPin("******");
    setConfirmPin("");

    setSecurityMessage(
      "App Lock enabled successfully 🔐"
    );
  }

  return (
    <main className="settings-page">

      <header className="settings-header">

        <button
          onClick={() =>
            window.history.back()
          }
          className="back-button"
        >
          ← Back
        </button>

        <h1>
          Business Settings
        </h1>

        <span></span>

      </header>

      {/* BUSINESS FORM */}

      <section className="settings-box">

        <div className="settings-title">

          <div className="settings-icon">
            🏪
          </div>

          <div>
            <h2>
              {editingId !== null
                ? "Edit Business"
                : "Add Business"}
            </h2>

            <p>
              Save multiple business
              profiles in one app.
            </p>
          </div>

        </div>

        <div className="settings-note">

          <strong>
            Optional
          </strong>

          <span>
            You can leave any field
            blank. Only filled details
            will appear on the invoice.
          </span>

        </div>

        <div className="settings-form">

          <div className="form-group">

            <label>
              Business / Shop Name
            </label>

            <input
              type="text"
              placeholder="e.g. Sameer Garments"
              value={
                business.businessName
              }
              onChange={(e) =>
                handleChange(
                  "businessName",
                  e.target.value
                )
              }
            />

          </div>

          <div className="form-group">

            <label>
              Owner Name
            </label>

            <input
              type="text"
              placeholder="e.g. Sameer Khan"
              value={
                business.ownerName
              }
              onChange={(e) =>
                handleChange(
                  "ownerName",
                  e.target.value
                )
              }
            />

          </div>

          <div className="form-group">

            <label>
              Phone Number
            </label>

            <input
              type="tel"
              placeholder="e.g. 9876XXXXXX"
              value={
                business.phone
              }
              onChange={(e) =>
                handleChange(
                  "phone",
                  e.target.value
                )
              }
            />

          </div>

          <div className="form-group">

            <label>
              Address
            </label>

            <textarea
              placeholder="Shop / Business address"
              value={
                business.address
              }
              onChange={(e) =>
                handleChange(
                  "address",
                  e.target.value
                )
              }
              rows={3}
            />

          </div>

          <div className="form-group">

            <label>
              GSTIN
            </label>

            <input
              type="text"
              placeholder="Optional"
              value={
                business.gstin
              }
              onChange={(e) =>
                handleChange(
                  "gstin",
                  e.target.value.toUpperCase()
                )
              }
            />

          </div>

          <div className="form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Optional"
              value={
                business.email
              }
              onChange={(e) =>
                handleChange(
                  "email",
                  e.target.value
                )
              }
            />

          </div>

        </div>

        <div className="business-form-actions">

          <button
            className="save-business"
            onClick={
              saveBusiness
            }
          >
            {editingId !== null
              ? "Update Business"
              : "Save Business Details"}
          </button>

          {editingId !== null && (
            <button
              className="cancel-business"
              onClick={
                cancelEdit
              }
            >
              Cancel
            </button>
          )}

        </div>

        {message && (
          <p className="settings-message">
            {message}
          </p>
        )}

      </section>

      {/* BUSINESS LIST */}

      <section className="business-list-section">

        <div className="business-list-title">

          <div>
            <h2>
              Business Profiles
            </h2>

            <p>
              Select the business
              that should appear
              on invoices.
            </p>
          </div>

          <span>
            {businesses.length}
          </span>

        </div>

        {businesses.length ===
        0 ? (
          <div className="business-empty">

            <div>
              🏪
            </div>

            <strong>
              No business profiles
            </strong>

            <p>
              Add your first business
              above.
            </p>

          </div>
        ) : (
          <div className="business-list">

            {businesses.map(
              (item) => {

                const isActive =
                  activeBusinessId ===
                  item.id;

                return (
                  <div
                    className={
                      isActive
                        ? "business-profile active"
                        : "business-profile"
                    }
                    key={item.id}
                  >

                    <div className="business-profile-top">

                      <div className="business-profile-icon">
                        🏪
                      </div>

                      <div className="business-profile-info">

                        <strong>
                          {item.businessName ||
                            "Unnamed Business"}
                        </strong>

                        {item.ownerName && (
                          <span>
                            Owner:{" "}
                            {
                              item.ownerName
                            }
                          </span>
                        )}

                        {item.phone && (
                          <span>
                            📞{" "}
                            {item.phone}
                          </span>
                        )}

                      </div>

                      {isActive && (
                        <span className="active-business-badge">
                          ACTIVE
                        </span>
                      )}

                    </div>

                    {item.address && (
                      <p className="business-address">
                        📍{" "}
                        {item.address}
                      </p>
                    )}

                    {item.gstin && (
                      <p className="business-gstin">
                        GSTIN:{" "}
                        {item.gstin}
                      </p>
                    )}

                    <div className="business-profile-actions">

                      {!isActive && (
                        <button
                          className="select-business"
                          onClick={() =>
                            selectBusiness(
                              item.id
                            )
                          }
                        >
                          Use This Business
                        </button>
                      )}

                      <button
                        className="edit-business"
                        onClick={() =>
                          editBusiness(
                            item
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-business"
                        onClick={() =>
                          deleteBusiness(
                            item.id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </section>

      {/* SECURITY */}

      <section className="settings-box security-settings-box">

        <div className="settings-title">

          <div className="settings-icon">
            🔐
          </div>

          <div>
            <h2>
              Security
            </h2>

            <p>
              Protect your HisabPro
              app with an App Lock PIN.
            </p>
          </div>

        </div>

        <div className="settings-note">

          <strong>
            App Lock
          </strong>

          <span>
            Your PIN is stored as a
            SHA-256 hash instead of
            plain text.
          </span>

        </div>

        <div className="security-row">

          <div>
            <strong>
              App Lock
            </strong>

            <small>
              Require PIN to open
              HisabPro.
            </small>
          </div>

          <button
            type="button"
            className={
              appLockEnabled
                ? "security-toggle active"
                : "security-toggle"
            }
            onClick={() => {
              setAppLockEnabled(
                !appLockEnabled
              );

              setSecurityMessage("");
            }}
          >
            {appLockEnabled
              ? "ON"
              : "OFF"}
          </button>

        </div>

        {appLockEnabled && (
          <div className="security-form">

            <div className="form-group">

              <label>
                PIN Length
              </label>

              <select
                value={pinLength}
                onChange={(e) => {
                  setPinLength(
                    e.target.value
                  );

                  setAppPin("");
                  setConfirmPin("");
                  setSecurityMessage("");
                }}
              >
                <option value="4">
                  4 Digit PIN
                </option>

                <option value="6">
                  6 Digit PIN
                </option>
              </select>

            </div>

            <div className="form-group">

              <label>
                {appPin === "******"
                  ? "Change PIN"
                  : "Create PIN"}
              </label>

              <input
                type="password"
                inputMode="numeric"
                maxLength={
                  Number(pinLength)
                }
                value={
                  appPin === "******"
                    ? ""
                    : appPin
                }
                onChange={(e) =>
                  setAppPin(
                    e.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                placeholder={
                  `Enter ${pinLength} digit PIN`
                }
              />

            </div>

            <div className="form-group">

              <label>
                Confirm PIN
              </label>

              <input
                type="password"
                inputMode="numeric"
                maxLength={
                  Number(pinLength)
                }
                value={
                  confirmPin
                }
                onChange={(e) =>
                  setConfirmPin(
                    e.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                placeholder="Confirm PIN"
              />

            </div>

            <div className="form-group">

              <label>
                Auto Lock
              </label>

              <select
                value={autoLock}
                onChange={(e) =>
                  setAutoLock(
                    e.target.value
                  )
                }
              >
                <option value="immediately">
                  Immediately
                </option>

                <option value="1">
                  After 1 minute
                </option>

                <option value="5">
                  After 5 minutes
                </option>

                <option value="15">
                  After 15 minutes
                </option>
              </select>

            </div>

          </div>
        )}

        {securityMessage && (
          <p className="security-message">
            {securityMessage}
          </p>
        )}

        <button
          type="button"
          className="save-business security-save-button"
          onClick={
            saveSecuritySettings
          }
        >
          Save Security Settings
        </button>

      </section>

    </main>
  );
}
