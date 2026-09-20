import { useEffect, useState } from "react";
import { getStoreInfo, toUserFacingError } from "../services/api.js";
import Button from "./ui/Button.jsx";
import EmptyState from "./ui/EmptyState.jsx";
import LoadingIndicator from "./LoadingIndicator.jsx";
import StatusMessage from "./StatusMessage.jsx";

const STORE_LOAD_FALLBACK =
  "Store details could not be loaded. Please refresh the page or ask an employee.";

function displayList(items) {
  return Array.isArray(items) && items.length > 0 ? items.join(", ") : "Ask an employee";
}

export default function StoreInfoCard() {
  const [store, setStore] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadStore() {
      setLoading(true);
      setError("");
      try {
        const data = await getStoreInfo();
        if (!active) return;
        setStore(data);
      } catch (err) {
        if (!active) return;
        setStore(null);
        setError(toUserFacingError(err, STORE_LOAD_FALLBACK));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStore();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const phoneDigits = String(store?.phone || "").replace(/[^\d+]/g, "");

  return (
    <aside className="card store-card" aria-labelledby="store-info-heading">
      <h2 id="store-info-heading">Store information</h2>
      {loading && <LoadingIndicator label="Loading store details…" />}
      <StatusMessage tone="error">{error}</StatusMessage>
      {error && !loading && (
        <Button
          variant="ghost"
          onClick={() => setReloadKey((value) => value + 1)}
          disabled={loading}
        >
          Try loading store details again
        </Button>
      )}
      {!loading && !error && !store && (
        <EmptyState>Store details are not available right now.</EmptyState>
      )}
      {store && !loading && (
        <dl>
          <div>
            <dt>Name</dt>
            <dd>{store.name || "Ask an employee"}</dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>{store.address || "Ask an employee"}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>
              {store.phone && phoneDigits ? (
                <a href={`tel:${phoneDigits}`} aria-label={`Call Moon's Food Store at ${store.phone}`}>
                  {store.phone}
                </a>
              ) : (
                "Ask an employee"
              )}
            </dd>
          </div>
          <div>
            <dt>Hours</dt>
            <dd>{store.hours || "Ask an employee"}</dd>
          </div>
          <div>
            <dt>Services</dt>
            <dd>{displayList(store.services)}</dd>
          </div>
          <div>
            <dt>Products</dt>
            <dd>{displayList(store.productCategories)}</dd>
          </div>
        </dl>
      )}
    </aside>
  );
}
