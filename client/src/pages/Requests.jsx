import React, { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { useAuth } from "../auth/AuthContext.jsx";
import toast, { Toaster } from "react-hot-toast";

export default function Requests() {
  const { token } = useAuth();
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const [inc, out] = await Promise.all([
        api.get("/requests/incoming", token),
        api.get("/requests/outgoing", token),
      ]);
      setIncoming(inc || []);
      setOutgoing(out || []);
    } catch (err) {
      toast.error("Failed to load requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleResponse(id, accept) {
    try {
      setLoadingId(id);
      await api.post(`/swap-response/${id}`, { accept }, token);
      toast.success(accept ? "Swap accepted!" : "Swap rejected");
      await load();
    } catch (err) {
      toast.error("Action failed");
    } finally {
      setLoadingId(null);
    }
  }

  if (loading) {
    return (
      <div className="container text-center">
        <Toaster />
        <h2>Loading requests...</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <Toaster />
      <div className="page-header requests-header">
        <div>
          <h1 className="page-title">Swap Requests</h1>
          <p className="page-subtitle">
            Manage incoming and outgoing slot swap requests
          </p>
        </div>
      </div>

      <div className="grid">
        {/* === Incoming === */}
        <div className="market-card">
          <h3>Incoming Requests</h3>
          {incoming.length === 0 ? (
            <p className="muted text-center">No incoming swap requests</p>
          ) : (
            incoming.map((req) => (
              <div
                key={req._id}
                className={`request-item ${
                  req.status !== "PENDING" ? "finalized" : ""
                }`}
              >
                <div className="request-info">
                  <h4>{req.requester?.name || "User"}</h4>
                  <p className="muted">
                    <span className="label">Their slot:</span>{" "}
                    {req.mySlot?.title || "N/A"}
                  </p>
                  <p className="muted">
                    <span className="label">Your slot:</span>{" "}
                    {req.theirSlot?.title || "N/A"}
                  </p>
                  <div className="status-container">
                    <span
                      className={`status-badge ${
                        req.status === "PENDING"
                          ? "pending"
                          : req.status === "ACCEPTED"
                          ? "accepted"
                          : "rejected"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>

                {req.status === "PENDING" && (
                  <div className="request-actions">
                    <button
                      className="btn-accept"
                      onClick={() => handleResponse(req._id, true)}
                      disabled={loadingId === req._id}
                    >
                      {loadingId === req._id ? "Processing..." : "Accept"}
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleResponse(req._id, false)}
                      disabled={loadingId === req._id}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* === Outgoing === */}
        <div className="market-card">
          <h3>Outgoing Requests</h3>
          {outgoing.length === 0 ? (
            <p className="muted text-center">No outgoing swap requests</p>
          ) : (
            outgoing.map((r) => (
              <div
                key={r._id}
                className={`request-item ${
                  r.status !== "PENDING" ? "finalized" : ""
                }`}
              >
                <div className="request-info">
                  <h4>To: {r.responder?.name || "User"}</h4>
                  <p className="muted">
                    <span className="label">My slot:</span>{" "}
                    {r.mySlot?.title || "N/A"}
                  </p>
                  <p className="muted">
                    <span className="label">Their slot:</span>{" "}
                    {r.theirSlot?.title || "N/A"}
                  </p>
                  <div className="status-container">
                    <span
                      className={`status-badge ${
                        r.status === "PENDING"
                          ? "pending"
                          : r.status === "ACCEPTED"
                          ? "accepted"
                          : "rejected"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
