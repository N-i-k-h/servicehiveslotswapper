import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { api } from "../services/api.js";
import toast, { Toaster } from "react-hot-toast";

export default function Marketplace() {
  const { token } = useAuth();
  const [swappables, setSwappables] = useState([]);
  const [mySwappables, setMySwappables] = useState([]);
  const [offerFor, setOfferFor] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      const [market, mine] = await Promise.all([
        api.get("/swappable-slots", token),
        api.get("/events", token),
      ]);
      setSwappables(market || []);
      setMySwappables((mine || []).filter((e) => e.status === "SWAPPABLE"));
    } catch (err) {
      toast.error(err.message || "Load failed");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function requestSwap(theirSlot) {
    setOfferFor(theirSlot);
  }

  async function sendRequest(mySlotId, theirSlotId) {
    setLoading(true);
    try {
      await api.post("/swap-request", { mySlotId, theirSlotId }, token);
      toast.success("🎉 Swap request sent successfully!");
      setOfferFor(null);
      await load();
    } catch (err) {
      toast.error(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Toaster />
      <div className="page-header marketplace-header">
        <div>
          <h1 className="page-title">Swap Marketplace</h1>
          <p className="page-subtitle">
            Find available slots and offer yours in exchange
          </p>
        </div>
      </div>

      <div className="grid">
        {/* === Available Slots === */}
        <div className="market-card">
          <h3>Available Slots</h3>
          {swappables.length === 0 ? (
            <p className="muted text-center">No slots available right now.</p>
          ) : (
            <div className="market-list">
              {swappables.map((s) => (
                <div key={s._id} className="market-item">
                  <div>
                    <div className="market-title">{s.title}</div>
                    <div className="muted">
                      {s.owner?.name || "User"} •{" "}
                      {new Date(s.startTime).toLocaleString()}
                    </div>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() => requestSwap(s)}
                  >
                    Offer Swap
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* === My Swappable Slots === */}
        <div className="market-card">
          <h3>Your Swappable Slots</h3>
          {mySwappables.length === 0 ? (
            <p className="muted text-center">
              You don’t have any swappable slots yet.  
              Mark one of your events as swappable from your calendar.
            </p>
          ) : (
            <div className="market-list">
              {mySwappables.map((s) => (
                <div key={s._id} className="market-item my-slot">
                  <div>
                    <div className="market-title">{s.title}</div>
                    <div className="muted">
                      {new Date(s.startTime).toLocaleString()}
                    </div>
                  </div>
                  <span className="status-badge">SWAPPABLE</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* === Modal === */}
      {offerFor && (
        <div className="modal">
          <div className="card modal-card animate-pop">
            <h3>Offer a Slot for:</h3>
            <p className="highlight">{offerFor.title}</p>
            <p className="muted small-text">
              Choose one of your swappable slots:
            </p>

            {mySwappables.length === 0 ? (
              <p className="muted">No swappable slots available.</p>
            ) : (
              mySwappables.map((ms) => (
                <div key={ms._id} className="market-item">
                  <div>
                    <div className="market-title">{ms.title}</div>
                    <div className="muted">
                      {new Date(ms.startTime).toLocaleString()}
                    </div>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() => sendRequest(ms._id, offerFor._id)}
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Offer this"}
                  </button>
                </div>
              ))
            )}

            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setOfferFor(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
