import React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Search, Plus, BookOpen, Laptop, Bike, Armchair, Calculator, Shirt,
  Heart, MapPin, ShieldCheck, Menu, X, ArrowUpRight, LogOut, UserRound,
  SlidersHorizontal, Package, Mail, CheckCircle2, AlertCircle, House, User, Phone, Camera, LayoutDashboard, Clock, ShoppingBag, Activity, Eye, RefreshCw
} from "lucide-react";
import { supabase } from "./supabase";

const collegeEmailDomain = (import.meta.env.VITE_COLLEGE_EMAIL_DOMAIN || "").trim().toLowerCase();
const isAllowedCollegeEmail = (email) => {
  const normalized = email.trim().toLowerCase();
  return !!collegeEmailDomain && normalized.endsWith(`@${collegeEmailDomain}`);
};

const categories = [
  { name: "All items", icon: Package },
  { name: "Books", icon: BookOpen },
  { name: "Electronics", icon: Laptop },
  { name: "Cycles", icon: Bike },
  { name: "Hostel essentials", icon: Armchair },
  { name: "Calculators", icon: Calculator },
  { name: "Clothing", icon: Shirt },
];

const demoItems = [
  { id: "demo-1", title: "Engineering Mathematics Books", category: "Books", price: 350, condition: "Good", location: "Campus pickup", description: "Useful for first-year engineering. A few highlights inside.", image_url: "", seller_email: "seller@example.edu", demo: true },
  { id: "demo-2", title: "Scientific Calculator", category: "Calculators", price: 650, condition: "Like new", location: "Campus pickup", description: "Works perfectly, used for one semester.", image_url: "", seller_email: "seller@example.edu", demo: true },
  { id: "demo-3", title: "Study Table Lamp", category: "Hostel essentials", price: 250, condition: "Good", location: "Hostel pickup", description: "Bright LED lamp for late-night study sessions.", image_url: "", seller_email: "seller@example.edu", demo: true },
  { id: "demo-4", title: "Wireless Mouse", category: "Electronics", price: 400, condition: "Good", location: "Campus pickup", description: "Comfortable mouse, USB receiver included.", image_url: "", seller_email: "seller@example.edu", demo: true },
  { id: "demo-5", title: "Single-speed Bicycle", category: "Cycles", price: 2200, condition: "Used", location: "Main gate meetup", description: "Reliable cycle for getting around campus.", image_url: "", seller_email: "seller@example.edu", demo: true },
  { id: "demo-6", title: "Intro to Programming Book", category: "Books", price: 180, condition: "Good", location: "Campus pickup", description: "A handy reference for programming beginners.", image_url: "", seller_email: "seller@example.edu", demo: true },
];

const categoryColors = {
  Books: "lavender", Electronics: "blue", Cycles: "mint",
  "Hostel essentials": "peach", Calculators: "yellow", Clothing: "pink"
};

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
}

function ProductArt({ item, large = false }) {
  if (item.image_url) return <img className={`product-photo ${large ? "large" : ""}`} src={item.image_url} alt={item.title} />;
  const color = categoryColors[item.category] || "lavender";
  const Icon = categories.find(c => c.name === item.category)?.icon || Package;
  return (
    <div className={`product-art ${color} ${large ? "large" : ""}`}>
      <span className="art-orbit orbit-one" />
      <span className="art-orbit orbit-two" />
      <Icon size={large ? 78 : 58} strokeWidth={1.35} />
      <span className="art-label">{item.category}</span>
    </div>
  );
}

function AuthModal({ onClose, onSignedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signup");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!collegeEmailDomain) {
      setError("Set VITE_COLLEGE_EMAIL_DOMAIN in .env.local to your college email domain.");
      return;
    }
    if (!isAllowedCollegeEmail(email)) {
      setError(`Please use your college email ending in @${collegeEmailDomain}.`);
      return;
    }

    setBusy(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password
        });
        if (error) throw error;
        if (!data.session) {
          setMessage("Account created. Check your email to confirm your account, then sign in.");
          setMode("login");
          return;
        }
        onSignedIn(data.user);
        onClose();
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password
        });
        if (error) throw error;
        onSignedIn(data.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || "Could not sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <section className="modal auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close"><X size={20}/></button>
        <div className="modal-icon"><ShieldCheck size={26}/></div>
        <p className="eyebrow">CAMPUS COMMUNITY</p>
        <h2 id="auth-title">Your campus, your marketplace.</h2>
        <p className="muted">Use your college email and a password to continue.</p>
        <div className="auth-tabs">
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => {setMode("signup");setError("");setMessage("");}}>Create account</button>
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => {setMode("login");setError("");setMessage("");}}>Sign in</button>
        </div>
        <form onSubmit={submit} className="form-stack">
          <label htmlFor="college-email">College email</label>
          <div className="input-with-icon"><Mail size={18}/><input id="college-email" type="email" required placeholder="you@college.edu" value={email} onChange={e => setEmail(e.target.value)}/></div>
          <label htmlFor="college-password">Password</label>
          <input id="college-password" type="password" required minLength={6} placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)}/>
          <button className="button primary full" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"} <ArrowUpRight size={17}/></button>
        </form>
        {error && <p className="notice error"><AlertCircle size={17}/>{error}</p>}
        {message && <p className="notice success"><CheckCircle2 size={17}/>{message}</p>}
        <p className="fine-print">Use your own account. Email-domain checks in the interface should also be enforced by secure database policies.</p>
      </section>
    </div>
  );
}

function SellModal({ onClose, onCreated, user }) {
  const [form, setForm] = useState({ title: "", category: "Books", price: "", condition: "Good", location: "Campus pickup", description: "" });
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!user) { setError("Please sign in with your college email before posting."); return; }
    if (image && image.size > 5 * 1024 * 1024) { setError("Image must be smaller than 5 MB."); return; }
    setBusy(true);
    try {
      let image_url = "";
      if (image) {
        const extension = (image.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const imagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(imagePath, image, {
            contentType: image.type,
            upsert: false
          });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(imagePath);
        image_url = publicUrlData.publicUrl;
      }
      const { error: insertError } = await supabase.from("listings").insert({
        title: form.title.trim(),
        category: form.category,
        price: Number(form.price),
        condition: form.condition,
        location: form.location.trim(),
        description: form.description.trim(),
        image_url,
        seller_id: user.id,
        seller_email: user.email || "",
        seller_name: user.user_metadata?.display_name || "",
        seller_avatar_url: user.user_metadata?.avatar_url || "",
        seller_whatsapp: user.user_metadata?.whatsapp || "",
        status: "available",
        stock_status: "in_stock"
      });
      if (insertError) throw insertError;
      await onCreated();
      onClose();
    } catch (err) {
      setError(err.message || "Could not create listing. Check your Supabase table, storage bucket, and security policies.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <section className="modal sell-modal" role="dialog" aria-modal="true" aria-labelledby="sell-title">
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close"><X size={20}/></button>
        <p className="eyebrow">GIVE IT A SECOND LIFE</p><h2 id="sell-title">Post an item</h2>
        <p className="muted">Be clear about the condition and arrange a safe campus handover.</p>
        <form onSubmit={submit} className="form-stack">
          <label>Item title<input required maxLength="90" value={form.title} onChange={e => update("title", e.target.value)} placeholder="e.g. Engineering Mathematics book"/></label>
          <div className="form-row">
            <label>Category<select value={form.category} onChange={e => update("category", e.target.value)}>{categories.slice(1).map(c => <option key={c.name}>{c.name}</option>)}</select></label>
            <label>Price (₹)<input required type="number" min="0" max="10000000" step="1" value={form.price} onChange={e => update("price", e.target.value)} placeholder="250"/></label>
          </div>
          <div className="form-row">
            <label>Condition<select value={form.condition} onChange={e => update("condition", e.target.value)}>{["Like new", "Good", "Used", "For parts"].map(v => <option key={v}>{v}</option>)}</select></label>
            <label>Pickup location<input required maxLength="80" value={form.location} onChange={e => update("location", e.target.value)} placeholder="Campus pickup"/></label>
          </div>
          <label>Description<textarea rows="3" maxLength="1200" value={form.description} onChange={e => update("description", e.target.value)} placeholder="Describe the item, age, and any defects…"/></label>
          <label>Product photo <span className="muted inline-muted">(optional, max 5 MB)</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => setImage(e.target.files?.[0] || null)}/></label>
          {image && image.size > 5 * 1024 * 1024 && <p className="notice error">Image must be smaller than 5 MB.</p>}
          {error && <p className="notice error"><AlertCircle size={17}/>{error}</p>}
          <button className="button primary full" disabled={busy || (image && image.size > 5 * 1024 * 1024)}>{busy ? "Publishing…" : "Publish listing"} <ArrowUpRight size={17}/></button>
        </form>
      </section>
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState(demoItems);
  const [activeCategory, setActiveCategory] = useState("All items");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [showingFavorites, setShowingFavorites] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  useEffect(() => {
    function closeMenuOnEscape(event) { if (event.key === "Escape") setMobileNav(false); }
    window.addEventListener("keydown", closeMenuOnEscape);
    return () => window.removeEventListener("keydown", closeMenuOnEscape);
  }, []);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [dashboardData, setDashboardData] = useState({ listings: [], views: [], transactions: [], activity: [] });
  const [profileName, setProfileName] = useState("");
  const [profileWhatsapp, setProfileWhatsapp] = useState("");
  const [profileProgram, setProfileProgram] = useState("");
  const [profileBranch, setProfileBranch] = useState("");
  const [profileYear, setProfileYear] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileHasBeenSaved, setProfileHasBeenSaved] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    if (profileOpen && user) {
      setProfileName(user.user_metadata?.display_name || "");
      setProfileWhatsapp(user.user_metadata?.whatsapp || "");
      setProfileProgram(user.user_metadata?.study_program || "");
      setProfileBranch(user.user_metadata?.branch || "");
      setProfileYear(user.user_metadata?.study_year || "");
      setProfilePhotoPreview(user.user_metadata?.avatar_url || "");
      setProfilePhotoFile(null);
      const metadata = user.user_metadata || {};
      setProfileHasBeenSaved(Boolean(metadata.display_name || metadata.whatsapp || metadata.study_program || metadata.branch || metadata.study_year || metadata.avatar_url));
      setProfileMessage("");
    }
  }, [profileOpen, user]);

  async function logActivity(eventType, details = {}) {
    if (!user) return;
    const { error } = await supabase.from("account_activity").insert({
      user_id: user.id,
      event_type: eventType,
      details
    });
    if (error) console.warn("Could not save account activity:", error.message);
  }

  async function openDashboard() {
    if (!user) { setAuthOpen(true); return; }
    setMobileNav(false);
    setDashboardOpen(true);
    setDashboardLoading(true);
    setDashboardError("");
    try {
      const [listingsResult, viewsResult, transactionsResult, activityResult] = await Promise.all([
        supabase.from("listings").select("id,title,price,status,created_at,category,image_url").eq("seller_id", user.id).order("created_at", { ascending: false }),
        supabase.from("listing_views").select("id,listing_id,viewed_at").eq("user_id", user.id).order("viewed_at", { ascending: false }).limit(20),
        supabase.from("transactions").select("id,listing_id,buyer_id,seller_id,status,created_at,completed_at,listings(title,price)").or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`).order("created_at", { ascending: false }).limit(20),
        supabase.from("account_activity").select("id,event_type,details,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20)
      ]);
      const firstError = listingsResult.error || viewsResult.error || transactionsResult.error || activityResult.error;
      if (firstError) throw firstError;
      const viewedIds = [...new Set((viewsResult.data || []).map(row => row.listing_id).filter(Boolean))];
      let viewedListings = [];
      if (viewedIds.length) {
        const { data, error } = await supabase.from("listings").select("id,title,price,category,image_url,status").in("id", viewedIds);
        if (error) throw error;
        const byId = new Map((data || []).map(item => [String(item.id), item]));
        viewedListings = (viewsResult.data || []).map(view => ({ ...view, listing: byId.get(String(view.listing_id)) })).filter(view => view.listing);
      }
      setDashboardData({ listings: listingsResult.data || [], views: viewedListings, transactions: transactionsResult.data || [], activity: activityResult.data || [] });
    } catch (error) {
      setDashboardError(error.message || "Could not load dashboard. Make sure the dashboard SQL setup has been run in Supabase.");
    } finally {
      setDashboardLoading(false);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (!user) return;
    setProfileSaving(true);
    setProfileMessage("");
    try {
      let avatarUrl = user.user_metadata?.avatar_url || "";
      if (profilePhotoFile) {
        const extension = (profilePhotoFile.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const imagePath = `${user.id}/profile-${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(imagePath, profilePhotoFile, { contentType: profilePhotoFile.type, upsert: false });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("product-images").getPublicUrl(imagePath);
        avatarUrl = data.publicUrl;
      }
      const { data, error } = await supabase.auth.updateUser({
        data: { display_name: profileName.trim(), whatsapp: profileWhatsapp.trim(), study_program: profileProgram, branch: profileBranch, study_year: profileYear, avatar_url: avatarUrl }
      });
      if (error) throw error;
      setUser(data.user);
      setProfilePhotoPreview(data.user.user_metadata?.avatar_url || "");
      setProfilePhotoFile(null);
      setProfileHasBeenSaved(true);
      await logActivity("profile_updated", { message: "Student profile updated" });
      setProfileMessage("Profile saved successfully.");
    } catch (error) {
      setProfileMessage(error.message || "Could not save profile. Check your photo storage permissions.");
    } finally {
      setProfileSaving(false);
    }
  }
  const [loading, setLoading] = useState(false);
  const [dbError, setDbError] = useState("");
  
async function toggleFavorite(item) {
  if (!user) {
    setAuthOpen(true);
    return;
  }

  if (item.demo || String(item.id).startsWith("demo-")) {
    setDbError("Demo products cannot be saved. Try a real listing.");
    return;
  }

  const isFavorite = favoriteIds.some(id => String(id) === String(item.id));

  setFavoriteIds(current =>
    isFavorite
      ? current.filter(id => String(id) !== String(item.id))
      : [...current, item.id]
  );

  const result = isFavorite
    ? await supabase
        .from("favorites")
        .delete()
        .eq("listing_id", item.id)
        .eq("user_id", user.id)
    : await supabase
        .from("favorites")
        .insert({
          listing_id: item.id,
          user_id: user.id
        });

  if (result.error) {
    setFavoriteIds(current =>
      isFavorite
        ? [...current, item.id]
        : current.filter(id => String(id) !== String(item.id))
    );

    setDbError("Could not update favorites. Please try again.");
    console.error("Favorite error:", result.error.message);
  } else {
    setDbError("");
  }
}

  
  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      setDbError("Could not sign out. Please try again.");
    }
  }


  function openListingDetail(item) {
    setDetail(item);
    if (user && item?.id && !item.demo && !String(item.id).startsWith("demo-")) {
      supabase.from("listing_views").insert({ listing_id: item.id, user_id: user.id }).then(({ error }) => {
        if (error) console.warn("Could not record listing view:", error.message);
      });
      logActivity("listing_viewed", { title: item.title, listing_id: item.id }).catch(() => {});
    }
  }

  async function updateStockStatus(item, nextStatus) {
    if (!user) { setAuthOpen(true); return; }
    if (item.demo || String(item.id).startsWith("demo-")) {
      setDbError("Demo products cannot be updated. Choose one of your real listings.");
      return;
    }
    if (item.seller_id !== user.id) {
      setDbError("You can only update the stock status of your own listings.");
      return;
    }
    const { error } = await supabase
      .from("listings")
      .update({ stock_status: nextStatus })
      .eq("id", item.id)
      .eq("seller_id", user.id);
    if (error) {
      setDbError(`Could not update stock status: ${error.message}`);
      return;
    }
    setItems(current => current.map(row => String(row.id) === String(item.id) ? { ...row, stock_status: nextStatus } : row));
    setDetail(current => current && String(current.id) === String(item.id) ? { ...current, stock_status: nextStatus } : current);
    setDbError("");
    await logActivity("listing_stock_updated", { title: item.title, stock_status: nextStatus });
  }

  async function deleteListing(item) {
    if (!user) { setAuthOpen(true); return; }
    if (item.demo || String(item.id).startsWith("demo-")) {
      setDbError("Demo products cannot be deleted.");
      return;
    }
    if (item.seller_id !== user.id) {
      setDbError("You can only delete your own listings.");
      return;
    }
    const confirmed = window.confirm(`Delete “${item.title}”? This cannot be undone.`);
    if (!confirmed) return;
    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", item.id)
      .eq("seller_id", user.id);
    if (error) {
      setDbError(`Could not delete listing: ${error.message}`);
      return;
    }
    setItems(current => current.filter(row => String(row.id) !== String(item.id)));
    setDetail(current => current && String(current.id) === String(item.id) ? null : current);
    setDbError("");
    await logActivity("listing_deleted", { title: item.title, listing_id: item.id });
  }

  async function loadListings() {
    setLoading(true);
    setDbError("");
    try {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("status", "available")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setItems((data || []).map(item => ({
        ...item,
        seller_email: item.seller_email || "",
        image_url: item.image_url || ""
      })));
    } catch (error) {
      setDbError("Could not load live listings. Check your Supabase URL, key, table, and policies.");
      setItems(demoItems);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setUser(data.session?.user ?? null);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => { loadListings(); }, []);
  
useEffect(() => {
  let cancelled = false;

  async function loadFavorites() {
    if (!user) {
      setFavoriteIds([]);
      setShowingFavorites(false);
      return;
    }

    setFavoritesLoading(true);

    const { data, error } = await supabase
      .from("favorites")
      .select("listing_id");

    if (!cancelled) {
      if (error) {
        console.error("Could not load favorites:", error.message);
      } else {
        setFavoriteIds(data.map(row => row.listing_id));
      }

      setFavoritesLoading(false);
    }
  }

  loadFavorites();

  return () => {
    cancelled = true;
  };
}, [user]);


  // const filtered = useMemo(() => items.filter(item => {
  //   const categoryMatch = activeCategory === "All items" || item.category === activeCategory;
  //   const text = `${item.title} ${item.description || ""} ${item.category}`.toLowerCase();
  //   return categoryMatch && text.includes(search.trim().toLowerCase());
  // }), [items, activeCategory, search]);

  // async function signOut() {
  //   try {
  //     const { error } = await supabase.auth.signOut();
  //     if (error) throw error;
  //   } catch (error) {
  //     setDbError("Could not sign out. Please try again.");
  //   }
  // }
  
const filtered = useMemo(() => items.filter(item => {
  const categoryMatch =
    activeCategory === "All items" ||
    item.category === activeCategory;

  const text =
    `${item.title} ${item.description || ""} ${item.category}`.toLowerCase();

  const searchMatch = text.includes(search.trim().toLowerCase());

  const favoriteMatch =
    !showingFavorites || favoriteIds.some(id => String(id) === String(item.id));

  return categoryMatch && searchMatch && favoriteMatch;
}), [items, activeCategory, search, showingFavorites, favoriteIds]);

const searchSuggestions = items.filter((item) => {
  const query = search.trim().toLowerCase();

  if (!query) return false;

  const text = [
    item.title,
    item.description,
    item.category,
    item.location
  ]
    .map(value => String(value || "").toLowerCase())
    .join(" ");

  return text.includes(query);
}).slice(0, 5);

// console.log("CampusOLX filter check:", {
//   search,
//   activeCategory,
//   totalItems: items.length,
//   filteredItems: filtered.length,
//   categories: items.map(item => item.category)
// });


  return (
    <div className="app-shell">
      <div className="announcement"><span className="announcement-dot"/> Made for campus life <span className="announcement-separator">·</span> Buy better. Waste less. <span className="announcement-right">A student-to-student marketplace</span></div>
      <header className="site-header">
        <a className="brand" href="/" aria-label="CampusOLX home" onClick={e => { e.preventDefault(); window.location.reload(); }}>
          <img className="campusolx-logo-mark" src="/campusolx-logo.png" alt="CampusOLX logo" style={{ width: 42, height: 42, objectFit: "contain", display: "block", flexShrink: 0 }} /><span className="brand-name">campus<span>olx</span><small>YOUR CAMPUS MARKETPLACE</small></span>
        </a>
        {/* <div className="header-search"><Search size={19}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search books, electronics, cycles…"/><kbd>⌘ K</kbd></div> */}
        
<div
  className="header-search"
  style={{ position: "relative" }}
>
  <Search size={19} />

  <input
    value={search}
    onChange={e => {
      setSearch(e.target.value);
      setSearchOpen(true);
    }}
    onFocus={() => setSearchOpen(true)}
    onKeyDown={e => {
      if (e.key === "Escape") setSearchOpen(false);
      if (e.key === "Enter" && searchSuggestions.length > 0) {
        openListingDetail(searchSuggestions[0]);
        setSearchOpen(false);
      }
    }}
    placeholder="Search books, electronics, cycles…"
  />

  <kbd>⌘ K</kbd>

  {searchOpen && search.trim() && (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        right: 0,
        background: "#ffffff",
        border: "1px solid #e8e3da",
        borderRadius: "12px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
        zIndex: 1000,
        overflow: "hidden",
        color: "#222222"
      }}
    >
      {searchSuggestions.length > 0 ? (
        searchSuggestions.map(item => (
          <button
            key={item.id}
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={() => {
              openListingDetail(item);
              setSearchOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              width: "100%",
              padding: "12px",
              border: "none",
              borderBottom: "1px solid #f0ede7",
              background: "#ffffff",
              textAlign: "left",
              cursor: "pointer",
              color: "#222222"
            }}
          >
            <span style={{ flex: 1 }}>
              <strong style={{ display: "block" }}>
                {item.title}
              </strong>
              <small>
                {item.category} · {formatPrice(item.price)}
              </small>
            </span>
            <ArrowUpRight size={17} />
          </button>
        ))
      ) : (
        <p style={{ padding: "12px", margin: 0 }}>
          No matching products found.
        </p>
      )}
    </div>
  )}
</div>

        <nav className="header-actions">
          {user ? (
            <button className="button quiet" onClick={signOut}><LogOut size={17}/> Sign out</button>
          ) : (
            <button className="button quiet" onClick={() => setAuthOpen(true)}><UserRound size={17}/> Sign in</button>
          )}
          <button className="button primary sell-button" onClick={() => user ? setSellOpen(true) : setAuthOpen(true)}><Plus size={18}/> Sell an item</button>
        </nav>
        <div className="menu-wrapper">
          <button type="button" className="icon-button mobile-menu" onClick={() => setMobileNav(value => !value)} aria-label={mobileNav ? "Close menu" : "Open menu"} aria-expanded={mobileNav} aria-controls="campusolx-menu">{mobileNav ? <X size={24} /> : <Menu size={24} />}</button>
          <aside id="campusolx-menu" className={`sidebar-nav ${mobileNav ? "mobile-open" : ""}`} aria-label="Main navigation">
        <div className="sidebar-heading">MENU</div>
        <button className="sidebar-link" onClick={() => {
          setActiveCategory("All items"); setSearch(""); setShowingFavorites(false); setMobileNav(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}><House size={19}/> <span>Home</span></button>
        <button className="sidebar-link" onClick={() => {
          setMobileNav(false); setShowingFavorites(false);
          document.getElementById("marketplace")?.scrollIntoView({ behavior: "smooth" });
        }}><Search size={19}/> <span>Browse Products</span></button>
        <button className={`sidebar-link ${showingFavorites ? "active" : ""}`} onClick={() => {
          setMobileNav(false);
          if (!user) { setAuthOpen(true); return; }
          setShowingFavorites(true);
          document.getElementById("marketplace")?.scrollIntoView({ behavior: "smooth" });
        }}><Heart size={19}/> <span>My Favorites</span></button>
        <button className="sidebar-link" onClick={() => {
          setMobileNav(false);
          if (user) setSellOpen(true); else setAuthOpen(true);
        }}><Plus size={19}/> <span>Sell an Item</span></button>
        <button className="sidebar-link" onClick={openDashboard}><LayoutDashboard size={19}/> <span>Student Dashboard</span></button>
        <button className="sidebar-link" onClick={() => {
          setMobileNav(false);
          if (!user) setAuthOpen(true); else setProfileOpen(true);
        }}><UserRound size={19}/> <span>My Profile</span></button>
        <div className="sidebar-bottom">
          <div className="sidebar-note"><ShieldCheck size={17}/><span>Made for your campus community</span></div>
          {user ? <button className="sidebar-signout" onClick={signOut}><LogOut size={16}/> Sign out</button> : <button className="sidebar-signout" onClick={() => setAuthOpen(true)}><UserRound size={16}/> Sign in</button>}
        </div>
      </aside>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="hero-pill"><span/> THE CAMPUS EXCHANGE</div>
            <h1>Good finds.<br/>Great <span>campus</span> stories.</h1>
            <p>Your next semester essential is probably sitting in someone else's room. Find it here, for less.</p>
            <div className="hero-buttons"><button className="button primary" onClick={() => document.getElementById("marketplace")?.scrollIntoView({behavior:"smooth"})}>Explore listings <ArrowUpRight size={17}/></button><button className="button secondary" onClick={() => user ? setSellOpen(true) : setAuthOpen(true)}><Plus size={17}/> List your first item</button></div>
            <div className="hero-trust"><span className="trust-icon"><ShieldCheck size={17}/></span><span><strong>Student community</strong><small>College-email sign-in</small></span><span className="trust-divider"/><span><strong>Campus pickup</strong><small>Meet, check, exchange</small></span></div>
          </div>
          <div className="hero-visual" aria-label="Illustration of student marketplace items">
            <div className="hero-sticker sticker-top"><span className="sticker-spark">✳</span> PRE-LOVED, WELL-LOVED</div>
            <div className="hero-circle circle-back"/>
            <div className="hero-book"><div className="book-spine"/><BookOpen size={76} strokeWidth={1.1}/><span>THE<br/>NEXT<br/>CHAPTER</span></div>
            <div className="hero-calculator"><div className="calc-screen">123.45</div><div className="calc-keys">{Array.from({length:12},(_,i)=><i key={i}/>)}</div></div>
            <div className="hero-headphones"><span/><span/><span/></div>
            <div className="hero-price"><small>YOUR NEXT FIND</small><strong>₹250</strong><span>and a new story ↗</span></div>
            <div className="hero-sticker sticker-bottom">↗ PASS IT ON</div>
          </div>
        </section>

        <section className="stats-strip">
          <div><span className="stat-icon orange"><BookOpen size={20}/></span><span><strong>Books & notes</strong><small>Knowledge goes around</small></span></div>
          <div><span className="stat-icon violet"><Laptop size={20}/></span><span><strong>Tech & gadgets</strong><small>Upgrade for less</small></span></div>
          <div><span className="stat-icon green"><Armchair size={20}/></span><span><strong>Hostel essentials</strong><small>Make room for more</small></span></div>
          <div><span className="stat-icon blue"><Bike size={20}/></span><span><strong>Campus life</strong><small>Get around with ease</small></span></div>
        </section>

        <section id="marketplace" className="marketplace section-wrap">
     
<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
  <button
    className="button secondary filter-button"
    onClick={() => setShowingFavorites(value => !value)}
  >
    <Heart
      size={17}
      fill={showingFavorites ? "currentColor" : "none"}
    />
    {showingFavorites ? "Show All Items" : "Show Favorites"}
  </button>

  <button
    className="button secondary filter-button"
    onClick={() => {
      setActiveCategory("All items");
      setSearch("");
      setShowingFavorites(false);
    }}
  >
    <SlidersHorizontal size={17} /> Clear filters
  </button>
</div>

          <div className="category-list">
            {categories.map(({name,icon:Icon}) => <button key={name} className={`category-chip ${activeCategory === name ? "selected" : ""}`} onClick={() => setActiveCategory(name)}><Icon size={17}/>{name}</button>)}
          </div>

          {dbError && <div className="demo-banner"><AlertCircle size={17}/><span>{dbError}</span></div>}
          <div className="listing-summary"><span>{loading ? "Loading listings…" : `${filtered.length} ${filtered.length === 1 ? "item" : "items"} to discover`}</span><span className="sort-label">Sorted by <strong>Recently added ↓</strong></span></div>
          <div className="product-grid">
            {filtered.map((item, index) => <article className="product-card" key={item.id}>
              <button className="product-click-area" onClick={() => openListingDetail(item)} aria-label={`View ${item.title}`}>
                <div className="product-image-wrap"><ProductArt item={item}/><span className="condition-tag">{item.condition}</span>{item.stock_status === "out_of_stock" && <span className="stock-status-badge" style={{ position: "absolute", left: 10, top: 10, zIndex: 2, background: "#b42318", color: "white", padding: "5px 9px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>Out of Stock</span>}</div>
                <div className="product-info"><div className="product-category">{item.category}</div><h3>{item.title}</h3><div className="product-price">{formatPrice(item.price)}</div><div className="product-location"><MapPin size={14}/>{item.location || "Campus pickup"}</div></div>
              </button>
              {user && item.seller_id === user.id && !item.demo && <div className="seller-listing-controls" style={{ display: "flex", gap: 8, padding: "0 12px 12px", flexWrap: "wrap" }}>
                <button type="button" className="button secondary" style={{ fontSize: 12, padding: "7px 10px" }} onClick={() => updateStockStatus(item, item.stock_status === "out_of_stock" ? "in_stock" : "out_of_stock")}>{item.stock_status === "out_of_stock" ? "Mark In Stock" : "Mark Out of Stock"}</button>
                <button type="button" className="button secondary" style={{ fontSize: 12, padding: "7px 10px", color: "#b42318" }} onClick={() => deleteListing(item)}>Delete</button>
              </div>}
             
<button
  className="favorite-button"
  title={
    favoriteIds.includes(item.id)
      ? "Remove from favorites"
      : "Add to favorites"
  }
  aria-label={
    favoriteIds.includes(item.id)
      ? "Remove from favorites"
      : "Add to favorites"
  }
  onClick={() => toggleFavorite(item)}
>
  <Heart
    size={18}
    fill={favoriteIds.some(id => String(id) === String(item.id)) ? "currentColor" : "none"}
  />
</button>

              {index === 0 && <span className="new-tag">CAMPUS PICK</span>}
            </article>)}
          </div>
          {!filtered.length && <div className="empty-state"><div><Search size={28}/></div><h3>No items found</h3><p>Try another search or category. Your next great find may be one click away.</p><button className="button secondary" onClick={() => {setSearch("");setActiveCategory("All items");}}>Show all items</button></div>}
          <div className="sell-cta"><div className="cta-art"><Package size={38}/><span>↗</span></div><div><p className="eyebrow">CLEAR YOUR SHELF, NOT YOUR WALLET</p><h3>Someone on campus needs what you don't.</h3><p>Turn your pre-loved stuff into someone else's perfect find.</p></div><button className="button primary" onClick={() => user ? setSellOpen(true) : setAuthOpen(true)}>Sell an item <ArrowUpRight size={17}/></button></div>
        </section>

        <section className="how-section">
          <div className="section-wrap"><div className="section-heading centered"><div><p className="eyebrow">SIMPLE BY DESIGN</p><h2>Good things go <span>full circle.</span></h2></div></div><div className="steps-grid">
            <div className="step-card"><span className="step-number">01</span><div className="step-icon"><Search size={24}/></div><h3>Find your thing</h3><p>Search student listings for the things you need, at prices that make sense.</p></div>
            <div className="step-card"><span className="step-number">02</span><div className="step-icon"><MessageIcon/></div><h3>Connect on campus</h3><p>Contact the seller and agree on a public campus meetup.</p></div>
            <div className="step-card"><span className="step-number">03</span><div className="step-icon"><CheckCircle2 size={24}/></div><h3>Meet. Check. Exchange.</h3><p>Inspect the item before paying. A better deal, with less waste.</p></div>
          </div></div>
        </section>
      </main>

      <footer className="site-footer"><a className="brand footer-brand" href="#"><img className="campusolx-logo-mark" src="/campusolx-logo.png" alt="CampusOLX logo" style={{ width: 42, height: 42, objectFit: "contain", display: "block", flexShrink: 0 }} /><span className="brand-name">campus<span>olx</span><small>YOUR CAMPUS MARKETPLACE</small></span></a><p>Made for campus life. Built for second chances.</p><span>© {new Date().getFullYear()} CampusOLX</span></footer>

      {profileOpen && user && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setProfileOpen(false)}>
        <section className="modal profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
          <button className="icon-button modal-close" onClick={() => setProfileOpen(false)} aria-label="Close"><X size={20}/></button>
          <p className="eyebrow">YOUR CAMPUS ACCOUNT</p>
          <h2 id="profile-title">My Profile</h2>
          <p className="muted">Add a photo and WhatsApp number so campus buyers can recognize and contact you.</p>
          <form className="form-stack profile-form" onSubmit={saveProfile}>
            <div className="profile-photo-area">
              <div className="profile-avatar">
                {profilePhotoPreview ? <img src={profilePhotoPreview} alt="Profile" /> : <UserRound size={34} />}
              </div>
              <label className="button secondary profile-photo-button"><Camera size={16}/> {profilePhotoPreview ? "Change photo" : "Add photo"}
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) { setProfileMessage("Photo must be smaller than 5 MB."); return; }
                  setProfilePhotoFile(file);
                  setProfilePhotoPreview(URL.createObjectURL(file));
                  setProfileMessage("");
                }} />
              </label>
              <small>JPG, PNG or WebP · Max 5 MB</small>
            </div>
            <label>Your name
              <div className="input-with-icon"><UserRound size={17}/><input type="text" placeholder="Your name" value={profileName} onChange={event => setProfileName(event.target.value)} maxLength={80} required /></div>
            </label>
            <label>College email
              <div className="input-with-icon"><Mail size={17}/><input type="email" value={user.email || ""} readOnly /></div>
            </label>
            <label>WhatsApp number
              <div className="input-with-icon"><Phone size={17}/><input type="tel" inputMode="tel" placeholder="e.g. +91 98765 43210" value={profileWhatsapp} onChange={event => setProfileWhatsapp(event.target.value)} maxLength={25} /></div>
            </label>
            <label>Degree / Programme
              <select value={profileProgram} onChange={event => { setProfileProgram(event.target.value); setProfileYear(""); }} required>
                <option value="">Select your programme</option>
                <option value="B.Tech">B.Tech</option>
                <option value="M.Tech">M.Tech</option>
                <option value="Ph.D.">Ph.D.</option>
              </select>
            </label>
            <label>Branch / Department
              <select value={profileBranch} onChange={event => setProfileBranch(event.target.value)} required>
                <option value="">Select your department</option>
                <option value="Applied Physics and Materials Engineering">Applied Physics and Materials Engineering</option>
                <option value="Architecture and Planning">Architecture and Planning</option>
                <option value="Chemical Science and Technology">Chemical Science and Technology</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                <option value="Humanities and Social Sciences">Humanities and Social Sciences</option>
                <option value="Mathematics and Computing Technology">Mathematics and Computing Technology</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Mechatronics and Automation Engineering">Mechatronics and Automation Engineering</option>
              </select>
            </label>
            <label>Year of study
              <select value={profileYear} onChange={event => setProfileYear(event.target.value)} required>
                <option value="">Select your year</option>
                {(profileProgram === "M.Tech" ? ["1st Year", "2nd Year"] : profileProgram === "Ph.D." ? ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "6th Year"] : profileProgram === "B.Tech" ? ["1st Year", "2nd Year", "3rd Year", "4th Year"] : []).map(year => <option key={year} value={year}>{year}</option>)}
              </select>
            </label>
            {profileMessage && <p className={`notice ${profileMessage === "Profile saved successfully." ? "success" : "error"}`}>{profileMessage}</p>}
            <button className="button primary full" type="submit" disabled={profileSaving}>{profileSaving ? "Saving…" : profileHasBeenSaved ? "Change profile" : "Save profile"}</button>
          </form>
          <button className="button secondary full" onClick={() => { setProfileOpen(false); signOut(); }}><LogOut size={17}/> Sign out</button>
        </section>
      </div>}
      {dashboardOpen && user && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setDashboardOpen(false)}>
        <section className="modal dashboard-modal" role="dialog" aria-modal="true" aria-labelledby="dashboard-title">
          <button className="icon-button modal-close" onClick={() => setDashboardOpen(false)} aria-label="Close"><X size={20}/></button>
          <p className="eyebrow">YOUR CAMPUS ACTIVITY</p>
          <h2 id="dashboard-title">Student Dashboard</h2>
          <p className="muted">Your listings, viewing history, transactions, and account activity.</p>
          <button className="button secondary dashboard-refresh" onClick={openDashboard} disabled={dashboardLoading}><RefreshCw size={15}/> Refresh history</button>
          {dashboardError && <p className="notice error"><AlertCircle size={16}/>{dashboardError}</p>}
          {dashboardLoading ? <p className="dashboard-empty">Loading your activity…</p> : <>
            <div className="dashboard-stats">
              <div><Package size={19}/><strong>{dashboardData.listings.length}</strong><span>My listings</span></div>
              <div><Eye size={19}/><strong>{dashboardData.views.length}</strong><span>Recently viewed</span></div>
              <div><ShoppingBag size={19}/><strong>{dashboardData.transactions.length}</strong><span>Transactions</span></div>
            </div>
            <section className="dashboard-section"><h3><Package size={17}/> My selling history</h3>
              {dashboardData.listings.length ? <div className="dashboard-list">{dashboardData.listings.map(item => <div className="dashboard-row" key={item.id}><div><strong>{item.title}</strong><small>{item.category || "Listing"} · {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Date unavailable"}</small></div><span className="dashboard-status">{item.status || "available"}</span><b>{formatPrice(item.price)}</b></div>)}</div> : <p className="dashboard-empty">You haven't posted any real listings yet.</p>}
            </section>
            <section className="dashboard-section"><h3><Clock size={17}/> Recently viewed items</h3>
              {dashboardData.views.length ? <div className="dashboard-list">{dashboardData.views.map(view => <div className="dashboard-row" key={view.id}><div><strong>{view.listing.title}</strong><small>{view.listing.category || "Listing"} · Viewed {view.viewed_at ? new Date(view.viewed_at).toLocaleString() : "recently"}</small></div><b>{formatPrice(view.listing.price)}</b></div>)}</div> : <p className="dashboard-empty">No viewing history recorded yet. Sign in and open real listings to start building this history.</p>}
            </section>
            <section className="dashboard-section"><h3><ShoppingBag size={17}/> Bought and sold history</h3>
              {dashboardData.transactions.length ? <div className="dashboard-list">{dashboardData.transactions.map(tx => <div className="dashboard-row" key={tx.id}><div><strong>{tx.listings?.title || "Listing"}</strong><small>{tx.buyer_id === user.id ? "Buyer" : "Seller"} · {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : "Date unavailable"}</small></div><span className="dashboard-status">{tx.status || "pending"}</span><b>{formatPrice(tx.listings?.price)}</b></div>)}</div> : <p className="dashboard-empty">No transactions recorded. This section will populate only after a transaction is explicitly recorded in Supabase.</p>}
            </section>
            <section className="dashboard-section"><h3><Activity size={17}/> Account activity</h3>
              {dashboardData.activity.length ? <div className="dashboard-list">{dashboardData.activity.map(event => <div className="dashboard-row" key={event.id}><div><strong>{({profile_updated:"Profile updated",listing_viewed:"Viewed a listing",listing_created:"Posted a listing"})[event.event_type] || event.event_type.replaceAll("_", " ")}</strong><small>{event.details?.title || event.details?.message || "CampusOLX activity"}</small></div><small>{event.created_at ? new Date(event.created_at).toLocaleString() : ""}</small></div>)}</div> : <p className="dashboard-empty">No account activity recorded yet.</p>}
            </section>
          </>}
          <p className="fine-print">Only activity recorded after the required database tables are set up will appear. Older activity is not reconstructed.</p>
        </section>
      </div>}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSignedIn={setUser}/>}
      {sellOpen && <SellModal user={user} onClose={() => setSellOpen(false)} onCreated={async () => { await loadListings(); await logActivity("listing_created", { message: "A new listing was posted" }); }}/>}
      {detail && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setDetail(null)}><section className="modal detail-modal" role="dialog" aria-modal="true"><button className="icon-button modal-close" onClick={() => setDetail(null)} aria-label="Close"><X size={20}/></button><ProductArt item={detail} large/><p className="eyebrow">{detail.category}</p><h2>{detail.title}</h2><div className="detail-price">{formatPrice(detail.price)}</div><span className="condition-tag inline-tag">{detail.condition}</span> <span style={{ display: "inline-block", margin: "8px 0", padding: "5px 9px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: detail.stock_status === "out_of_stock" ? "#fee4e2" : "#dcfae6", color: detail.stock_status === "out_of_stock" ? "#b42318" : "#067647" }}>{detail.stock_status === "out_of_stock" ? "Out of Stock" : "In Stock"}</span><p>{detail.description || "No description provided."}</p><p className="product-location"><MapPin size={15}/>{detail.location || "Campus pickup"}</p><div className="seller-details"><p className="eyebrow">SELLER DETAILS</p><div className="seller-profile-row">{detail.seller_avatar_url ? <img className="seller-avatar" src={detail.seller_avatar_url} alt="Seller profile" /> : <div className="seller-avatar seller-avatar-placeholder"><UserRound size={22}/></div>}<div><strong>{detail.seller_name || "Campus seller"}</strong><small>{detail.seller_email || "College email not provided"}</small></div></div>{detail.stock_status !== "out_of_stock" && detail.seller_whatsapp ? <div className="seller-whatsapp-line"><span><strong>WhatsApp:</strong> {detail.seller_whatsapp}</span><a className="button secondary full" href={`https://wa.me/${detail.seller_whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">Contact on WhatsApp <ArrowUpRight size={16}/></a></div> : detail.stock_status === "out_of_stock" ? <p className="seller-whatsapp-missing">This item is out of stock. Contact is disabled.</p> : <p className="seller-whatsapp-missing">WhatsApp number not added by this seller.</p>}</div>{detail.seller_id === user?.id && !detail.demo && <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}><button type="button" className="button secondary" onClick={() => updateStockStatus(detail, detail.stock_status === "out_of_stock" ? "in_stock" : "out_of_stock")}>{detail.stock_status === "out_of_stock" ? "Mark In Stock" : "Mark Out of Stock"}</button><button type="button" className="button secondary" style={{ color: "#b42318" }} onClick={() => deleteListing(detail)}>Delete listing</button></div>}{detail.stock_status === "out_of_stock" ? <button className="button primary full" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>Out of Stock</button> : <button className="button primary full" onClick={() => { if (!user) { setDetail(null); setAuthOpen(true); return; } window.location.href = `mailto:${detail.seller_email || ""}?subject=${encodeURIComponent("Interested in " + detail.title)}`; }}>Email seller <ArrowUpRight size={17}/></button>}<p className="fine-print">Meet in a public campus location and inspect the item before paying. Never share passwords or verification codes.</p></section></div>}
    </div>
  );
}

function MessageIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/></svg>;
}