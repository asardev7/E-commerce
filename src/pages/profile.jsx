import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Spinner,
  Image,
  ListGroup,
  Modal,
} from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = "http://localhost:5000";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [verifying2FA, setVerifying2FA] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [enabling2FA, setEnabling2FA] = useState(false);
  const [twoFAError, setTwoFAError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [followLoadingId, setFollowLoadingId] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");

  const getToken = () => {
    const stored = localStorage.getItem("userInfo");
    if (!stored) return null;
    try {
      return JSON.parse(stored).token;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getToken();
        if (!token) return navigate("/login");

        const { data } = await axios.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
      } catch (err) {
        setError("Failed to load profile");
        console.error(err);
      }
    };

    fetchProfile();
  }, [navigate]);

  const getFollowingIds = () => {
    if (!user) return [];
    if (Array.isArray(user.followingIds)) return user.followingIds;
    if (Array.isArray(user.following)) {
      return user.following
        .map((item) => (typeof item === "string" ? item : item?._id))
        .filter(Boolean);
    }
    return [];
  };

  const isFollowingById = (userId) => getFollowingIds().includes(userId);

  const handleProfilePicChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setProfilePic(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file");
      setProfilePic(null);
      return;
    }
    setError("");
    setProfilePic(file);
  };

  const uploadProfilePictureHandler = async (e) => {
    e.preventDefault();
    if (!profilePic) {
      setError("Please select an image first");
      return;
    }

    const token = getToken();
    if (!token) return navigate("/login");

    try {
      setUploading(true);
      setError("");
      setMessage("");

      const formData = new FormData();
      formData.append("profilePicture", profilePic);

      const { data } = await axios.post(
        "/api/users/uploadProfilePicture",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser((prev) =>
        prev ? { ...prev, profilePicture: data.profilePicture } : prev
      );

      setMessage("Profile picture updated successfully");
      setProfilePic(null);
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.message || "Image upload failed");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleKeywordChange = (e) => {
    const value = e.target.value;
    setKeyword(value);
    if (!value.trim()) {
      setResults([]);
    }
  };

  const searchHandler = async (e) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    const token = getToken();
    if (!token) return navigate("/login");

    try {
      setSearching(true);
      setError("");
      setMessage("");

      const { data } = await axios.get(
        `/api/users/search?keyword=${encodeURIComponent(trimmed)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const processed = data.map((u) => ({
        ...u,
        profilePicture: u.profilePicture
          ? u.profilePicture.startsWith("http")
            ? u.profilePicture
            : `http://localhost:5000${u.profilePicture}`
          : null,
        isFollowing:
          typeof u.isFollowing === "boolean"
            ? u.isFollowing
            : isFollowingById(u._id),
      }));

      setResults(processed);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed");
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setEnabling2FA(true);
      setTwoFAError("");
      setCopyStatus("");
      setQrCodeUrl("");
      setTwoFactorSecret("");
      setOtpToken("");
      setShow2FAModal(true);

      const token = getToken();
      if (!token) {
        setTwoFAError("Please log in again to enable 2FA.");
        navigate("/login");
        return;
      }

      const { data } = await axios.post(
        "/api/auth/enable2FA",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQrCodeUrl(data.qrCodeUrl);
      setTwoFactorSecret(data.secret);
    } catch (err) {
      setTwoFAError(err.response?.data?.message || "Failed to enable 2FA");
      console.error(err);
    } finally {
      setEnabling2FA(false);
    }
  };

  const handleClose2FAModal = () => {
    setShow2FAModal(false);
    setTwoFAError("");
    setCopyStatus("");
    setOtpToken("");
  };

  const verify2FA = async (e) => {
    e.preventDefault();

    const token = getToken();
    if (!token) return navigate("/login");

    try {
      setVerifying2FA(true);
      setTwoFAError("");

      await axios.post(
        "/api/auth/verify2FA",
        { token: otpToken },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("2FA enabled successfully!");
      setShow2FAModal(false);
      setUser((prev) => (prev ? { ...prev, twoFactorEnabled: true } : prev));
      setOtpToken("");
      setError("");
    } catch (err) {
      setTwoFAError(err.response?.data?.message || "Invalid OTP code");
      console.error(err);
    } finally {
      setVerifying2FA(false);
    }
  };

  const copySecret = async () => {
    if (!twoFactorSecret) return;
    try {
      await navigator.clipboard.writeText(twoFactorSecret);
      setCopyStatus("Secret copied!");
      setTimeout(() => setCopyStatus(""), 1500);
    } catch (err) {
      setCopyStatus("Copy failed");
      setTimeout(() => setCopyStatus(""), 1500);
      console.error(err);
    }
  };

  const followUser = async (userId) => {
    const token = getToken();
    if (!token) return navigate("/login");

    try {
      setFollowLoadingId(userId);
      setError("");
      setMessage("");

      const { data } = await axios.post(
        `/api/users/${userId}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const targetUser = results.find((u) => u._id === userId);
      const nextFollowing = data.isFollowing;

      // Update results list
      setResults((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isFollowing: nextFollowing } : u
        )
      );

      // Update user following count and IDs
      setUser((prev) => {
        if (!prev) return prev;
        const currentIds = getFollowingIds();
        const nextIds = nextFollowing
          ? Array.from(new Set([...currentIds, userId]))
          : currentIds.filter((id) => id !== userId);

        return {
          ...prev,
          followingCount: nextIds.length,
          followingIds: nextIds,
        };
      });

      setMessage(
        nextFollowing
          ? `Now following ${targetUser?.username || "user"}`
          : `Unfollowed ${targetUser?.username || "user"}`
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to update follow status"
      );
      console.error(error);
    } finally {
      setFollowLoadingId(null);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return "/default-avatar.svg";
    if (path.startsWith("http")) return path;
    return `http://localhost:5000${path}`;
  };

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  const postsCount =
    user.postsCount ?? (Array.isArray(user.posts) ? user.posts.length : 0);
  const followersCount =
    user.followersCount ??
    (Array.isArray(user.followers) ? user.followers.length : 0);
  const followingCount =
    user.followingCount ??
    (Array.isArray(user.following) ? user.following.length : 0);

  const displayName = user.fullName || user.name || user.username || "User";
  const bio =
    user.bio ||
    "Add a short bio to tell people who you are and what you love.";
  const website = user.website || "";

  const highlightItems = ["New", "Travel", "Food", "Work", "Pets"];
  const tilesToShow = postsCount > 0 ? Math.min(postsCount, 9) : 0;

  return (
    <Container className="ig-profile-page py-4">
      <div className="ig-shell">
        {(message || error) && (
          <div className="ig-alerts">
            {message && (
              <Alert 
                variant="success" 
                className="ig-alert"
                dismissible
                onClose={() => setMessage("")}
              >
                {message}
              </Alert>
            )}
            {error && (
              <Alert 
                variant="danger" 
                className="ig-alert"
                dismissible
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            )}
          </div>
        )}

        <Row className="g-4">
          <Col lg={8}>
            <Card className="ig-card ig-animate" style={{ animationDelay: "0ms" }}>
              <div className="ig-header">
                <div className="ig-avatar-block">
                  <div className="ig-avatar-ring">
                    <Image
                      src={getImageUrl(user.profilePicture)}
                      alt={`${user.username} avatar`}
                      className="ig-avatar-img"
                      onError={(e) => {
                        e.target.src = "/default-avatar.svg";
                      }}
                    />
                  </div>
                  <label
                    htmlFor="profilePicInput"
                    className="ig-avatar-edit"
                    title="Change photo"
                  >
                    Edit
                  </label>
                </div>

                <div className="ig-header-info">
                  <div className="ig-userline">
                    <h2 className="ig-username">{user.username}</h2>

                    <Form
                      onSubmit={uploadProfilePictureHandler}
                      className="ig-inline-form"
                    >
                      <Form.Control
                        id="profilePicInput"
                        type="file"
                        accept="image/*"
                        className="ig-file-input"
                        onChange={handleProfilePicChange}
                        hidden
                      />
                      <Button
                        as="label"
                        htmlFor="profilePicInput"
                        className="ig-btn ig-btn-outline"
                      >
                        Change Photo
                      </Button>
                      <Button
                        type="submit"
                        className="ig-btn ig-btn-primary"
                        disabled={uploading || !profilePic}
                      >
                        {uploading ? "Saving..." : "Save"}
                      </Button>
                    </Form>
                  </div>

                  {profilePic && (
                    <div className="ig-file-name">
                      Selected: {profilePic.name}
                    </div>
                  )}

                  <div className="ig-stats">
                    <div className="ig-stat">
                      <strong>{postsCount}</strong> posts
                    </div>
                    <div className="ig-stat">
                      <strong>{followersCount}</strong> followers
                    </div>
                    <div className="ig-stat">
                      <strong>{followingCount}</strong> following
                    </div>
                  </div>

                  <div className="ig-bio">
                    <div className="ig-name">{displayName}</div>
                    <p>{bio}</p>
                    {website && (
                      <a
                        className="ig-link"
                        href={website}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {website}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="ig-highlights">
                {highlightItems.map((item) => (
                  <div className="ig-highlight" key={item}>
                    <div className="ig-highlight-circle">
                      {item === "New" ? "+" : item[0]}
                    </div>
                    <div className="ig-highlight-label">{item}</div>
                  </div>
                ))}
              </div>

              <div className="ig-tabs">
                <button
                  type="button"
                  className={`ig-tab ${activeTab === "posts" ? "active" : ""}`}
                  onClick={() => setActiveTab("posts")}
                >
                  Posts
                </button>
                <button
                  type="button"
                  className={`ig-tab ${activeTab === "saved" ? "active" : ""}`}
                  onClick={() => setActiveTab("saved")}
                >
                  Saved
                </button>
                <button
                  type="button"
                  className={`ig-tab ${activeTab === "tagged" ? "active" : ""}`}
                  onClick={() => setActiveTab("tagged")}
                >
                  Tagged
                </button>
              </div>

              <div className="ig-grid">
                {activeTab !== "posts" ? (
                  <div className="ig-empty">
                    <div className="ig-empty-title">Nothing here yet</div>
                    <div className="ig-empty-sub">
                      Switch back to Posts to see your grid.
                    </div>
                  </div>
                ) : tilesToShow > 0 ? (
                  Array.from({ length: tilesToShow }).map((_, index) => (
                    <div className="ig-tile" key={index} />
                  ))
                ) : (
                  <div className="ig-empty">
                    <div className="ig-empty-title">No posts yet</div>
                    <div className="ig-empty-sub">
                      Share photos and videos to see them on your profile.
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </Col>

          <Col lg={4}>
            <Card
              className="ig-card ig-animate"
              style={{ animationDelay: "120ms" }}
            >
              <div className="ig-card-header">
                <h5 className="ig-card-title">Discover People</h5>
                {results.length > 0 && (
                  <span className="ig-badge">{results.length} found</span>
                )}
              </div>

              <Form onSubmit={searchHandler} className="ig-search-form">
                <div className="ig-search-row">
                  <Form.Control
                    placeholder="Search by username"
                    value={keyword}
                    onChange={handleKeywordChange}
                  />
                  <Button
                    type="submit"
                    className="ig-btn ig-btn-primary ig-btn-compact"
                    disabled={searching || !keyword.trim()}
                  >
                    {searching ? (
                      <Spinner size="sm" animation="border" />
                    ) : (
                      "Search"
                    )}
                  </Button>
                </div>
                {keyword.trim() && (
                  <Button
                    type="button"
                    className="ig-btn ig-btn-ghost ig-btn-compact ig-clear-btn"
                    onClick={() => {
                      setKeyword("");
                      setResults([]);
                    }}
                  >
                    Clear
                  </Button>
                )}
              </Form>

              <ListGroup variant="flush" className="ig-list">
                {results.map((u) => {
                  const isSelf = u._id === user._id;
                  const isFollowing =
                    typeof u.isFollowing === "boolean"
                      ? u.isFollowing
                      : isFollowingById(u._id);

                  return (
                    <ListGroup.Item key={u._id} className="ig-list-item">
                      <div className="ig-list-user">
                        <Image
                          src={getImageUrl(u.profilePicture)}
                          roundedCircle
                          width={44}
                          height={44}
                          alt={`${u.username} avatar`}
                          onError={(e) => {
                            e.target.src = "/default-avatar.svg";
                          }}
                        />
                        <div className="ig-list-meta">
                          <strong>{u.username}</strong>
                          {u.email && (
                            <span className="ig-muted-text">{u.email}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        className={`ig-btn ${
                          isFollowing ? "ig-btn-outline" : "ig-btn-primary"
                        } ig-btn-compact`}
                        disabled={isSelf || followLoadingId === u._id}
                        onClick={() => followUser(u._id)}
                      >
                        {isSelf ? (
                          "You"
                        ) : followLoadingId === u._id ? (
                          <Spinner size="sm" animation="border" />
                        ) : isFollowing ? (
                          "Following"
                        ) : (
                          "Follow"
                        )}
                      </Button>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>

              {!searching && keyword.trim() && results.length === 0 && (
                <div className="ig-empty-list">
                  No users found. Try another name.
                </div>
              )}
            </Card>

            <Card
              className="ig-card ig-animate ig-account-card"
              style={{ animationDelay: "200ms" }}
            >
              <div className="ig-card-header">
                <h5 className="ig-card-title">Account & Security</h5>
                <span
                  className={`ig-badge ${
                    user.twoFactorEnabled ? "ig-badge-success" : ""
                  }`}
                >
                  {user.twoFactorEnabled ? "2FA on" : "2FA off"}
                </span>
              </div>

              <div className="ig-account-row">
                <div>
                  <div className="ig-muted-text">Email</div>
                  <strong>{user.email}</strong>
                </div>
              </div>

              <div className="ig-account-row">
                <div>
                  <div className="ig-muted-text">Two-factor</div>
                  <strong>{user.twoFactorEnabled ? "Enabled" : "Disabled"}</strong>
                </div>
                {!user.twoFactorEnabled && (
                  <Button
                    className="ig-btn ig-btn-primary ig-btn-compact"
                    onClick={handleEnable2FA}
                    disabled={enabling2FA}
                  >
                    {enabling2FA ? "Setting up..." : "Enable 2FA"}
                  </Button>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <style>{`
        .ig-profile-page {
          --ig-bg: #fafafa;
          --ig-card: #ffffff;
          --ig-border: #dbdbdb;
          --ig-text: #111111;
          --ig-muted: #6b7280;
          --ig-accent: #0095f6;
          --ig-accent-2: #1c4dd9;
          --ig-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
          color: var(--ig-text);
        }

        .ig-shell {
          background: var(--ig-bg);
          border-radius: 28px;
          padding: 24px;
          box-shadow: var(--ig-shadow);
        }

        .ig-alerts {
          display: grid;
          gap: 8px;
          margin-bottom: 16px;
        }

        .ig-alert {
          margin-bottom: 0;
        }

        .ig-card {
          background: var(--ig-card) !important;
          border: 1px solid var(--ig-border) !important;
          border-radius: 22px !important;
          box-shadow: none !important;
          color: var(--ig-text) !important;
        }

        .ig-header {
          display: grid;
          grid-template-columns: 170px 1fr;
          gap: 24px;
          align-items: center;
        }

        .ig-avatar-block {
          position: relative;
          width: 150px;
          height: 150px;
          margin: 0 auto;
        }

        .ig-avatar-ring {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          padding: 4px;
          background: conic-gradient(
            #f58529,
            #dd2a7b,
            #8134af,
            #515bd4,
            #f58529
          );
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ig-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          border: 3px solid #fff;
          background: #fff;
        }

        .ig-avatar-edit {
          position: absolute;
          right: 6px;
          bottom: 6px;
          border-radius: 999px;
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid var(--ig-border);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          color: var(--ig-text);
        }

        .ig-userline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .ig-username {
          font-size: 1.6rem;
          font-weight: 600;
          margin: 0;
        }

        .ig-inline-form {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }

        .ig-file-input {
          display: none;
        }

        .ig-file-name {
          font-size: 0.75rem;
          color: var(--ig-muted);
          margin-top: 6px;
        }

        .ig-btn {
          border-radius: 999px !important;
          font-weight: 600;
          font-size: 0.85rem;
          padding: 8px 16px !important;
          border: 1px solid transparent !important;
          box-shadow: none !important;
        }

        .ig-btn-primary {
          background: var(--ig-accent) !important;
          color: #fff !important;
          border-color: var(--ig-accent) !important;
        }

        .ig-btn-outline {
          background: #fff !important;
          color: var(--ig-text) !important;
          border-color: var(--ig-border) !important;
        }

        .ig-btn-ghost {
          background: transparent !important;
          color: var(--ig-text) !important;
          border-color: var(--ig-border) !important;
        }

        .ig-btn-compact {
          padding: 6px 12px !important;
          font-size: 0.75rem;
        }

        .ig-stats {
          display: flex;
          gap: 16px;
          margin-top: 12px;
          flex-wrap: wrap;
        }

        .ig-stat {
          font-size: 0.95rem;
        }

        .ig-bio {
          margin-top: 10px;
        }

        .ig-name {
          font-weight: 600;
        }

        .ig-bio p {
          margin: 4px 0 0;
          color: var(--ig-muted);
        }

        .ig-link {
          color: var(--ig-accent-2);
          text-decoration: none;
          font-weight: 600;
        }

        .ig-highlights {
          display: flex;
          gap: 12px;
          margin-top: 18px;
          flex-wrap: wrap;
        }

        .ig-highlight {
          text-align: center;
          width: 78px;
        }

        .ig-highlight-circle {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          border: 1px solid var(--ig-border);
          background: linear-gradient(180deg, #fff, #f3f3f3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 6px;
          font-weight: 600;
          color: var(--ig-muted);
        }

        .ig-highlight-label {
          font-size: 0.75rem;
          color: var(--ig-muted);
        }

        .ig-tabs {
          margin-top: 18px;
          border-top: 1px solid var(--ig-border);
          display: flex;
          justify-content: center;
          gap: 24px;
          padding-top: 12px;
        }

        .ig-tab {
          background: transparent;
          border: none;
          font-size: 0.75rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--ig-muted);
          padding: 6px 8px;
          border-bottom: 2px solid transparent;
          cursor: pointer;
        }

        .ig-tab.active {
          color: var(--ig-text);
          border-color: var(--ig-text);
        }

        .ig-grid {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          min-height: 240px;
        }

        .ig-tile {
          background: #f1f1f1;
          border-radius: 10px;
          border: 1px solid var(--ig-border);
          aspect-ratio: 1 / 1;
          position: relative;
          overflow: hidden;
        }

        .ig-tile::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.08), transparent 60%);
        }

        .ig-empty {
          grid-column: 1 / -1;
          padding: 40px 20px;
          text-align: center;
          border: 1px dashed var(--ig-border);
          border-radius: 16px;
          color: var(--ig-muted);
        }

        .ig-empty-title {
          font-weight: 600;
          color: var(--ig-text);
          margin-bottom: 4px;
        }

        .ig-empty-sub {
          font-size: 0.9rem;
        }

        .ig-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }

        .ig-card-title {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .ig-search-form {
          display: grid;
          gap: 8px;
        }

        .ig-search-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
        }

        .ig-clear-btn {
          width: fit-content;
          justify-self: flex-start;
        }

        .ig-list {
          margin-top: 8px;
        }

        .ig-list-item {
          display: flex !important;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 4px !important;
        }

        .ig-list-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ig-list-meta {
          display: flex;
          flex-direction: column;
        }

        .ig-muted-text {
          color: var(--ig-muted);
          font-size: 0.75rem;
        }

        .ig-badge {
          background: #efefef;
          color: var(--ig-muted);
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          font-weight: 600;
        }

        .ig-badge-success {
          background: rgba(0, 149, 246, 0.12);
          color: var(--ig-accent);
        }

        .ig-secret {
          background: #f6f6f6;
          border: 1px solid var(--ig-border);
          border-radius: 10px;
          padding: 6px 10px;
          font-weight: 600;
        }

        .ig-empty-list {
          padding: 12px;
          color: var(--ig-muted);
          font-size: 0.85rem;
        }

        .ig-account-card {
          margin-top: 16px;
        }

        .ig-account-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 0;
          border-top: 1px solid var(--ig-border);
        }

        .ig-account-row:first-of-type {
          border-top: none;
        }

        .ig-animate {
          animation: ig-rise 0.6s ease both;
        }

        @keyframes ig-rise {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .ig-profile-page .form-control {
          background: #fff !important;
          border: 1px solid var(--ig-border) !important;
          color: var(--ig-text) !important;
        }

        .ig-profile-page .form-control::placeholder {
          color: var(--ig-muted) !important;
        }

        .ig-profile-page .list-group-item {
          border-color: var(--ig-border) !important;
          background: transparent !important;
        }

        .ig-profile-page .alert {
          border-radius: 14px;
          border: 1px solid var(--ig-border);
        }

        .ig-profile-page .alert-success {
          background: #d1e7dd;
          color: #0f5132;
        }

        .ig-profile-page .alert-danger {
          background: #f8d7da;
          color: #842029;
        }

        .ig-modal-content {
          border-radius: 18px !important;
          border: 1px solid var(--ig-border);
        }

        @media (max-width: 992px) {
          .ig-header {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .ig-userline {
            justify-content: center;
          }

          .ig-stats {
            justify-content: center;
          }
        }

        @media (max-width: 576px) {
          .ig-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <Modal
        show={show2FAModal}
        onHide={handleClose2FAModal}
        centered
        contentClassName="ig-modal-content"
      >
        <Modal.Header closeButton>
          <Modal.Title>Setup Two-Factor Authentication</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>Scan this QR code with your authenticator app:</p>
          <div className="d-flex justify-content-center mb-3">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="2FA QR Code"
                style={{ width: "200px", height: "200px" }}
              />
            ) : (
              <div className="text-muted small">
                <Spinner size="sm" animation="border" className="me-2" />
                Generating QR code...
              </div>
            )}
          </div>

          <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
            <span className="ig-secret">
              {twoFactorSecret || "Loading..."}
            </span>
            <Button
              className="ig-btn ig-btn-outline ig-btn-compact"
              onClick={copySecret}
              disabled={!twoFactorSecret}
            >
              Copy
            </Button>
          </div>
          {copyStatus && (
            <div className="ig-muted-text">{copyStatus}</div>
          )}

          {twoFAError && (
            <Alert variant="danger" className="mt-3">
              {twoFAError}
            </Alert>
          )}

          <Form onSubmit={verify2FA} className="mt-3">
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Enter 6-digit code from app"
                value={otpToken}
                onChange={(e) =>
                  setOtpToken(e.target.value.replace(/\D/g, ""))
                }
                maxLength={6}
                inputMode="numeric"
              />
            </Form.Group>
            <Button
              type="submit"
              className="ig-btn ig-btn-primary w-100 mt-3"
              disabled={verifying2FA || otpToken.length !== 6}
            >
              {verifying2FA ? "Verifying..." : "Verify & Enable 2FA"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Profile;
