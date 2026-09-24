"use client";

export default function ReturnsPage() {
  return (
    <main className="returns-page">
      <header className="returns-header">
        <button
          className="returns-back"
          onClick={() => {
            window.location.href = "/hisabpro/more/";
          }}
          aria-label="Back"
        >
          ←
        </button>

        <div>
          <h1>Returns</h1>
          <p>Sales Return • Purchase Return</p>
        </div>
      </header>

      <section className="returns-content">
        <div className="returns-intro">
          <h2>Return Management</h2>

          <p>
            Customer aur supplier returns ko easily manage karein.
          </p>
        </div>

        <div className="returns-options">

          <a
            href="/hisabpro/returns/sales/"
            className="return-option sales-return"
          >
            <div className="return-option-icon">
              ↩️
            </div>

            <div>
              <h3>Sales Return</h3>

              <p>
                Customer se returned product receive karein aur
                sale amount/Khata adjust karein.
              </p>
            </div>

            <span className="return-option-arrow">
              →
            </span>
          </a>

          <a
            href="/hisabpro/returns/purchase/"
            className="return-option purchase-return"
          >
            <div className="return-option-icon">
              ↪️
            </div>

            <div>
              <h3>Purchase Return</h3>

              <p>
                Supplier ko product return karein aur payable
                amount adjust karein.
              </p>
            </div>

            <span className="return-option-arrow">
              →
            </span>
          </a>

          <a
            href="/hisabpro/returns/history/"
            className="return-option return-history"
          >
            <div className="return-option-icon">
              📋
            </div>

            <div>
              <h3>Return History</h3>

              <p>
                Saare sales aur purchase returns ka record
                dekhein.
              </p>
            </div>

            <span className="return-option-arrow">
              →
            </span>
          </a>

        </div>
      </section>
    </main>
  );
}
