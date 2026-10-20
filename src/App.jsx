import React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Search, Plus, BookOpen, Laptop, Bike, Armchair, Calculator, Shirt,
  Heart, MapPin, ShieldCheck, Menu, X, ArrowUpRight, LogOut, UserRound,
  SlidersHorizontal, Package, Mail, CheckCircle2, AlertCircle
} from "lucide-react";
import { supabase, isSupabaseConfigured, collegeEmailDomain, isAllowedCollegeEmail } from "./lib/supabase";

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
  const [mode, setMode] = useState("signup");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError(""); setMessage("");
    if (!isSupabaseConfigured) {
      setError("Connect Supabase first. Follow SETUP.md, then refresh this page.");
      return;
    }
    if (!collegeEmailDomain) {
      setError("Set VITE_COLLEGE_EMAIL_DOMAIN in .env.local to your college's verified student email domain.");
      return;
    }
    if (!isAllowedCollegeEmail(email)) {
      setError(`Please use your college email ending in @${collegeEmailDomain}.`);
      return;
    }
    setBusy(true);
    const result = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: window.location.origin,
        shouldCreateUser: mode === "signup"
      }
    });
    setBusy(false);
    if (result.error) setError(result.error.message);
    else setMessage("Check your college inbox for the sign-in link. Open it on this device to continue.");
  }

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <section className="modal auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close"><X size={20}/></button>
        <div className="modal-icon"><ShieldCheck size={26}/></div>
        <p className="eyebrow">CAMPUS COMMUNITY</p>
        <h2 id="auth-title">Your campus, your marketplace.</h2>
        <p className="muted">Use your verified college email to continue. We’ll send you a secure sign-in link.</p>
        <div className="auth-tabs">
          <button className={mode === "signup" ? "active" : ""} onClick={() => {setMode("signup");setError("");setMessage("");}}>Create account</button>
          <button className={mode === "login" ? "active" : ""} onClick={() => {setMode("login");setError("");setMessage("");}}>Sign in</button>
        </div>
        <form onSubmit={submit} className="form-stack">
          <label htmlFor="college-email">College email</label>
          <div className="input-with-icon"><Mail size={18}/><input id="college-email" type="email" required placeholder="you@college.edu" value={email} onChange={e => setEmail(e.target.value)}/></div>
          <button className="button primary full" disabled={busy}>{busy ? "Sending link…" : "Email me a sign-in link"} <ArrowUpRight size={17}/></button>
        </form>
        {error && <p className="notice error"><AlertCircle size={17}/>{error}</p>}
        {message && <p className="notice success"><CheckCircle2 size={17}/>{message}</p>}
        <p className="fine-print">Email verification must also be enabled in Supabase. The domain check in the UI is not a security boundary; database policies protect listing access.</p>
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
    if (!isSupabaseConfigured) { setError("Connect Supabase first, then try again."); return; }
    setBusy(true);
    try {
      let image_url = null;
      if (image) {
        const extension = image.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
        const upload = await supabase.storage.from("product-images").upload(path, image, { upsert: false, contentType: image.type });
        if (upload.error) throw upload.error;
        const publicResult = supabase.storage.from("product-images").getPublicUrl(path);
        image_url = publicResult.data.publicUrl;
      }
      const { error: insertError } = await supabase.from("listings").insert({
        title: form.title.trim(), category: form.category, price: Number(form.price),
        condition: form.condition, location: form.location.trim(),
        description: form.description.trim(), image_url, seller_id: user.id
      });
      if (insertError) throw insertError;
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message || "Could not create listing. Check your database setup.");
    } finally { setBusy(false); }
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
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dbError, setDbError] = useState("");

  async function loadListings() {
    if (!isSupabaseConfigured) { setItems(demoItems); return; }
    setLoading(true); setDbError("");
    const { data, error } = await supabase.from("listings")
      .select("id,title,category,price,condition,location,description,image_url,seller_id,status,created_at")
      .eq("status", "available").order("created_at", { ascending: false }).limit(60);
    setLoading(false);
    if (error) { setDbError("Could not load live listings. Check SETUP.md and your Supabase policies."); setItems([]); return; }
    setItems(data || []);
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => { loadListings(); }, []);

  const filtered = useMemo(() => items.filter(item => {
    const categoryMatch = activeCategory === "All items" || item.category === activeCategory;
    const text = `${item.title} ${item.description || ""} ${item.category}`.toLowerCase();
    return categoryMatch && text.includes(search.trim().toLowerCase());
  }), [items, activeCategory, search]);

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <div className="app-shell">
      <div className="announcement"><span className="announcement-dot"/> Made for campus life <span className="announcement-separator">·</span> Buy better. Waste less. <span className="announcement-right">A student-to-student marketplace</span></div>
      <header className="site-header">
        <a className="brand" href="#" aria-label="CampusOLX home" onClick={e => {e.preventDefault();setActiveCategory("All items");setSearch("");}}>
          <span className="brand-mark">C<span>O</span></span><span className="brand-name">campus<span>olx</span><small>YOUR CAMPUS MARKETPLACE</small></span>
        </a>
        <div className="header-search"><Search size={19}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search books, electronics, cycles…"/><kbd>⌘ K</kbd></div>
        <nav className={mobileNav ? "header-actions open" : "header-actions"}>
          {user ? <button className="button quiet" onClick={signOut}><LogOut size={17}/> Sign out</button> : <button className="button quiet" onClick={() => setAuthOpen(true)}><UserRound size={17}/> Sign in</button>}
          <button className="button primary sell-button" onClick={() => user ? setSellOpen(true) : setAuthOpen(true)}><Plus size={18}/> Sell an item</button>
        </nav>
        <button className="icon-button mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle menu">{mobileNav ? <X/> : <Menu/>}</button>
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
          <div className="section-heading"><div><p className="eyebrow">THE GOOD STUFF</p><h2>Find your next <span>favourite.</span></h2><p className="muted">Useful things. Student-friendly prices. A little campus magic.</p></div><button className="button secondary filter-button" onClick={() => {setActiveCategory("All items");setSearch("");}}><SlidersHorizontal size={17}/> Clear filters</button></div>
          <div className="category-list">
            {categories.map(({name,icon:Icon}) => <button key={name} className={`category-chip ${activeCategory === name ? "selected" : ""}`} onClick={() => setActiveCategory(name)}><Icon size={17}/>{name}</button>)}
          </div>
          {!isSupabaseConfigured && <div className="demo-banner"><AlertCircle size={17}/><span><strong>Preview mode:</strong> sample listings are shown. Connect Supabase to enable real accounts and listings.</span></div>}
          {dbError && <div className="demo-banner"><AlertCircle size={17}/><span>{dbError}</span></div>}
          <div className="listing-summary"><span>{loading ? "Loading listings…" : `${filtered.length} ${filtered.length === 1 ? "item" : "items"} to discover`}</span><span className="sort-label">Sorted by <strong>Recently added ↓</strong></span></div>
          <div className="product-grid">
            {filtered.map((item, index) => <article className="product-card" key={item.id}>
              <button className="product-click-area" onClick={() => setDetail(item)} aria-label={`View ${item.title}`}>
                <div className="product-image-wrap"><ProductArt item={item}/><span className="condition-tag">{item.condition}</span></div>
                <div className="product-info"><div className="product-category">{item.category}</div><h3>{item.title}</h3><div className="product-price">{formatPrice(item.price)}</div><div className="product-location"><MapPin size={14}/>{item.location || "Campus pickup"}</div></div>
              </button>
              <button className="favorite-button" title="Sign in to save items" onClick={() => setAuthOpen(true)}><Heart size={18}/></button>
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

      <footer className="site-footer"><a className="brand footer-brand" href="#"><span className="brand-mark">C<span>O</span></span><span className="brand-name">campus<span>olx</span><small>YOUR CAMPUS MARKETPLACE</small></span></a><p>Made for campus life. Built for second chances.</p><span>© {new Date().getFullYear()} CampusOLX</span></footer>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSignedIn={setUser}/>}
      {sellOpen && <SellModal user={user} onClose={() => setSellOpen(false)} onCreated={loadListings}/>}
      {detail && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setDetail(null)}><section className="modal detail-modal" role="dialog" aria-modal="true"><button className="icon-button modal-close" onClick={() => setDetail(null)} aria-label="Close"><X size={20}/></button><ProductArt item={detail} large/><p className="eyebrow">{detail.category}</p><h2>{detail.title}</h2><div className="detail-price">{formatPrice(detail.price)}</div><span className="condition-tag inline-tag">{detail.condition}</span><p>{detail.description || "No description provided."}</p><p className="product-location"><MapPin size={15}/>{detail.location || "Campus pickup"}</p><button className="button primary full" onClick={() => {setDetail(null);if (!user) setAuthOpen(true); else window.location.href = `mailto:${detail.seller_email || ""}?subject=${encodeURIComponent("Interested in " + detail.title)}`;}}>Contact seller <ArrowUpRight size={17}/></button><p className="fine-print">Meet in a public campus location and inspect the item before paying. Never share passwords or verification codes.</p></section></div>}
    </div>
  );
}

function MessageIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/></svg>;
}
