import React, { useMemo, useState, useEffect } from "react";
import { ShoppingCart, Menu, X, MessageCircle, Trash2, Plus, Minus, Share2, Check } from "lucide-react";

/*
  TIENDA TEXTIL - VERSIÓN 1
  --------------------------------------------------
  Versión 1: productos quemados en un arreglo local.
  Versión 2: aquí se puede reemplazar este arreglo por datos leídos desde Excel.
  Versión 3: aquí se puede reemplazar por consumo de una API conectada a SQL.

  Estructura sugerida para Excel / SQL:
  id | nombre | categoria | precio | imagen | stock | descripcion | destacado | createdAt
*/

const WHATSAPP_NUMBER = "50240182873";

const categories = [
  "Todos",
  "Ponchitos",
  "Almohadas",
  "Toallas",
  "Cobertores",
  "Edredones",
  "Sábanas",
  "Cortinas",
];

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ1xiG1YAp326C6oCfT3qDk5xx4a7nDd3SW3rNFWUz_sLeBkeDv7mcTlTgo50Bvmz4cxwiurUme_IVs/pub?gid=0&single=true&output=csv";

function parseCSV(text) {
  const lines = text.trim().replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const [headerLine, ...rows] = lines;
  const headers = headerLine.split(",").map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());

  return rows
    .filter((row) => row.trim())
    .map((row) => {
      const values = [];
      let current = "";
      let inQuotes = false;
      for (const char of row) {
        if (char === '"') { inQuotes = !inQuotes; }
        else if (char === "," && !inQuotes) { values.push(current.trim().replace(/^"|"$/g, "")); current = ""; }
        else { current += char; }
      }
      values.push(current.trim().replace(/^"|"$/g, ""));
      const obj = {};
      headers.forEach((h, i) => { obj[h] = values[i] ?? ""; });
      return {
        id: Number(obj.id),
        nombre: obj.nombre,
        categoria: obj.categoria,
        precio: parseFloat(obj.precio),
        imagen: obj.imagen,
        stock: Number(obj.stock),
        descripcion: obj.descripcion,
        destacado: String(obj.destacado).toLowerCase() === "true",
        createdAt: obj.createdat || obj.createdAt || "",
      };
    })
    .filter((p) => p.nombre && !isNaN(p.precio));
}



function formatPrice(value) {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
  }).format(value);
}

function buildWhatsAppUrl(product) {
  const message = product
    ? `Hola, me interesa comprar o consultar por el producto: ${product.nombre}. Precio: ${formatPrice(product.precio)}.`
    : "Hola 👋😊, estoy interesado/a en conocer los productos textiles para el hogar 🛏️🧺✨ que ofrecen. ¿Podrían enviarme más información 📩📋? ¡Gracias! 🙌";

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

async function shareProduct(product, onCopied) {
  const text = `Mira este producto en Casa San Antonio: ${product.nombre} - ${formatPrice(product.precio)}`;
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title: product.nombre, text, url });
    } catch (_) {}
  } else {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    onCopied();
  }
}

function TopBar() {
  return (
    <div className="bg-stone-900 px-4 py-2 text-center text-sm font-medium text-white">
      Envío con pago contra entrega por Forza
    </div>
  );
}

const CATEGORY_NAMES = ["Ponchitos", "Almohadas", "Toallas", "Cobertores", "Edredones", "Sábanas", "Cortinas"];

function Header({ cartCount, onCartOpen, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = ["Inicio", ...CATEGORY_NAMES, "Contacto"];

  function handleClick(e, item) {
    e.preventDefault();
    setIsOpen(false);
    if (item === "Inicio") {
      onNavigate("Todos");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (item === "Contacto") {
      document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
    } else {
      onNavigate(item);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <a href="#" onClick={(e) => handleClick(e, "Inicio")} className="text-2xl font-black tracking-tight text-stone-900">
          Casa San Antonio<span className="text-amber-700">.</span>
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium text-stone-700 lg:flex">
          {menuItems.map((item) => (
            <a key={item} href="#" onClick={(e) => handleClick(e, item)} className="transition hover:text-amber-700">
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onCartOpen}
            className="relative rounded-full bg-stone-100 p-3 text-stone-900 transition hover:bg-amber-100"
            aria-label="Abrir carrito"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-700 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-full bg-stone-100 p-3 text-stone-900 lg:hidden"
            aria-label="Abrir menú"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <nav className="border-t border-stone-200 bg-white px-4 py-4 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-3 text-sm font-medium text-stone-700">
            {menuItems.map((item) => (
              <a key={item} href="#" onClick={(e) => handleClick(e, item)} className="rounded-xl px-3 py-2 hover:bg-stone-100">
                {item}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}


const CATEGORY_EMOJIS = {
  Ponchitos: "🧥",
  Almohadas: "🛏️",
  Toallas: "🛁",
  Cobertores: "🌙",
  Edredones: "✨",
  Sábanas: "🌿",
  Cortinas: "🪟",
};

function CategoryHighlights({ selectedCategory, setSelectedCategory }) {
  const highlighted = categories.filter((category) => category !== "Todos");

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 pb-2">
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setSelectedCategory("Todos")}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition hover:shadow-sm ${
            selectedCategory === "Todos" ? "border-amber-700 bg-amber-50 text-amber-900" : "border-stone-200 bg-white text-stone-700"
          }`}
        >
          🏠 Todos
        </button>
        {highlighted.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition hover:shadow-sm ${
              selectedCategory === category ? "border-amber-700 bg-amber-50 text-amber-900" : "border-stone-200 bg-white text-stone-700"
            }`}
          >
            {CATEGORY_EMOJIS[category]} {category}
          </button>
        ))}
      </div>
    </section>
  );
}

function CategoryFilter({ selectedCategory, setSelectedCategory, sortOrder, setSortOrder }) {
  return (
    <div className="mb-8 grid gap-4 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-semibold text-stone-700">Filtrar por categoría</label>
        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-amber-700"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-stone-700">Ordenar productos</label>
        <select
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-amber-700"
        >
          <option value="recent">Productos recientes</option>
          <option value="low-high">Precio: bajo a alto</option>
          <option value="high-low">Precio: alto a bajo</option>
        </select>
      </div>
    </div>
  );
}

function ProductModal({ product, allProducts, onClose, onAddToCart }) {
  const [qty, setQty] = useState(1);
  const [copied, setCopied] = useState(false);

  const related = allProducts
    .filter((p) => p.categoria === product.categoria && p.id !== product.id)
    .slice(0, 4);

  function handleShare() {
    shareProduct(product, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleAdd() {
    for (let i = 0; i < qty; i++) onAddToCart(product);
    onClose();
  }

  React.useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-y-auto rounded-[2rem] bg-white shadow-2xl">

          {/* Botones top-right */}
          <div className="absolute right-4 top-4 z-10 flex gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 text-xs font-bold text-stone-700 shadow hover:bg-stone-100"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Share2 size={14} />}
              {copied ? "¡Copiado!" : "Compartir"}
            </button>
            <button onClick={onClose} className="rounded-full bg-white/90 p-2 text-stone-700 shadow hover:bg-stone-100">
              <X size={20} />
            </button>
          </div>

          {/* Foto + info */}
          <div className="grid md:grid-cols-2">
            <div className="relative h-72 overflow-hidden rounded-t-[2rem] bg-stone-100 md:h-auto md:rounded-l-[2rem] md:rounded-tr-none">
              <img src={product.imagen} alt={product.nombre} className="h-full w-full object-cover" />
              {product.destacado && (
                <span className="absolute left-4 top-4 rounded-full bg-amber-700 px-3 py-1 text-xs font-bold text-white">Destacado</span>
              )}
            </div>

            <div className="flex flex-col justify-between p-6">
              <div>
                <span className="mb-2 inline-block rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">{product.categoria}</span>
                <h2 className="text-2xl font-black leading-tight text-stone-950">{product.nombre}</h2>
                <p className="mt-3 text-sm leading-6 text-stone-600">{product.descripcion}</p>
                <p className="mt-4 text-3xl font-black text-amber-800">{formatPrice(product.precio)}</p>
                <p className={`mt-1 text-sm font-semibold ${product.stock > 0 ? "text-emerald-700" : "text-red-600"}`}>
                  {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
                </p>
              </div>

              {product.stock > 0 && (
                <div className="mt-6">
                  <p className="mb-2 text-sm font-semibold text-stone-700">Cantidad</p>
                  <div className="mb-4 flex items-center gap-3">
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="rounded-full bg-stone-100 p-2 hover:bg-stone-200">
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center text-lg font-black">{qty}</span>
                    <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="rounded-full bg-stone-100 p-2 hover:bg-stone-200">
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    onClick={handleAdd}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-950 px-5 py-3.5 font-black text-white transition hover:bg-amber-800"
                  >
                    <ShoppingCart size={18} /> Agregar al carrito
                  </button>
                  <a
                    href={buildWhatsAppUrl(product)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-green-600 bg-green-50 px-5 py-3.5 text-center font-black text-green-700 transition hover:bg-green-600 hover:text-white"
                  >
                    <MessageCircle size={18} /> Consultar por WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Productos relacionados */}
          {related.length > 0 && (
            <div className="border-t border-stone-100 p-6">
              <p className="mb-4 text-sm font-bold uppercase tracking-wide text-stone-500">Más de {product.categoria}</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {related.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { onClose(); setTimeout(() => onAddToCart(p), 100); }}
                    className="group rounded-2xl border border-stone-200 bg-white p-2 text-left transition hover:border-amber-700 hover:shadow-md"
                  >
                    <img src={p.imagen} alt={p.nombre} className="mb-2 h-24 w-full rounded-xl object-cover transition group-hover:scale-105" />
                    <p className="text-xs font-bold leading-tight text-stone-900">{p.nombre}</p>
                    <p className="mt-1 text-xs font-black text-amber-800">{formatPrice(p.precio)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

function ProductCard({ product, onAddToCart, onOpenModal }) {
  const [copied, setCopied] = useState(false);

  function handleShare(e) {
    e.stopPropagation();
    shareProduct(product, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.7rem] border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div
        className="relative h-64 cursor-pointer overflow-hidden bg-stone-100"
        onClick={() => onOpenModal(product)}
      >
        <img src={product.imagen} alt={product.nombre} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-stone-800 backdrop-blur">
          {product.categoria}
        </span>
        {product.destacado && (
          <span className="absolute right-4 top-4 rounded-full bg-amber-700 px-3 py-1 text-xs font-bold text-white">
            Destacado
          </span>
        )}
        {/* Botón compartir sobre la imagen */}
        <button
          onClick={handleShare}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-stone-700 shadow backdrop-blur transition hover:bg-white"
        >
          {copied ? <Check size={13} className="text-green-600" /> : <Share2 size={13} />}
          {copied ? "¡Copiado!" : "Compartir"}
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3">
          <h3
            className="cursor-pointer text-lg font-black leading-tight text-stone-950 hover:text-amber-800 transition"
            onClick={() => onOpenModal(product)}
          >
            {product.nombre}
          </h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">{product.descripcion}</p>
          <p className="mt-3 text-2xl font-black text-amber-800">{formatPrice(product.precio)}</p>
        </div>

        <p className={`mb-5 text-sm font-semibold ${product.stock > 0 ? "text-emerald-700" : "text-red-600"}`}>
          {product.stock > 0 ? `Disponible: ${product.stock}` : "Agotado"}
        </p>

        <div className="mt-auto grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock <= 0}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-950 px-4 py-3.5 text-sm font-black text-white shadow-md transition hover:bg-amber-800 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            <ShoppingCart size={17} />
            Agregar
          </button>
          <a
            href={buildWhatsAppUrl(product)}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-green-600 bg-green-50 px-4 py-3.5 text-center text-sm font-black text-green-700 transition hover:bg-green-600 hover:text-white"
          >
            <MessageCircle size={17} />
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}

function ProductGrid({ products, allProducts, onAddToCart }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onOpenModal={setSelectedProduct}
          />
        ))}
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          allProducts={allProducts}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={onAddToCart}
        />
      )}
    </>
  );
}

const DEPARTAMENTOS_MUNICIPIOS = {
  "Alta Verapaz": ["Cobán","Chahal","Chisec","Fray Bartolomé de las Casas","Lanquín","Panzós","Raxruhá","San Cristóbal Verapaz","San Juan Chamelco","San Pedro Carchá","Santa Cruz Verapaz","Tactic","Tamahú","Tucurú"],
  "Baja Verapaz": ["Cubulco","El Chol","Granados","Purulhá","Rabinal","Salamá","San Jerónimo","San Miguel Chicaj"],
  "Chimaltenango": ["Acatenango","Chimaltenango","El Tejar","Parramos","Patzicía","Patzún","Pochuta","San Andrés Itzapa","San José Poaquil","San Juan Comalapa","San Martín Jilotepeque","Santa Apolonia","Santa Cruz Balanyá","Tecpán Guatemala","Yepocapa","Zaragoza"],
  "Chiquimula": ["Camotán","Chiquimula","Esquipulas","Ipala","Jocotán","Olopa","Quezaltepeque","San Jacinto","San José la Arada","San Juan Ermita"],
  "El Progreso": ["El Jícaro","Guastatoya","Morazán","San Agustín Acasaguastlán","San Antonio La Paz","San Cristóbal Acasaguastlán","Sanarate","Sansare"],
  "Escuintla": ["Escuintla","Guanagazapa","Iztapa","La Democracia","La Gomera","Masagua","Nueva Concepción","Palín","San José","San Vicente Pacaya","Santa Lucía Cotzumalguapa","Siquinalá","Tiquisate"],
  "Guatemala": ["Guatemala","Amatitlán","Chinautla","Chuarrancho","Fraijanes","Mixco","Palencia","Petapa","San José del Golfo","San José Pinula","San Juan Sacatepéquez","San Miguel Petapa","San Pedro Ayampuc","San Pedro Sacatepéquez","San Raymundo","Santa Catarina Pinula","Villa Canales","Villa Nueva"],
  "Huehuetenango": ["Aguacatán","Chiantla","Colotenango","Concepción Huista","Cuilco","Huehuetenango","Ixtahuacán","Jacaltenango","La Democracia","La Libertad","Malacatancito","Nentón","San Antonio Huista","San Gaspar Ixchil","San Ildefonso Ixtahuacán","San Juan Atitán","San Juan Ixcoy","San Marcos Huista","San Mateo Ixtatán","San Miguel Acatán","San Pedro Necta","San Rafael La Independencia","San Rafael Petzal","San Sebastián Coatán","San Sebastián Huehuetenango","Santa Ana Huista","Santa Bárbara","Santa Cruz Barillas","Santa Eulalia","Santiago Chimaltenango","Tectitán","Todos Santos Cuchumatán","Unión Cantinil"],
  "Izabal": ["El Estor","Livingston","Los Amates","Morales","Puerto Barrios"],
  "Jalapa": ["Jalapa","Mataquescuintla","Monjas","San Carlos Alzatate","San Luis Jilotepeque","San Manuel Chaparrón","San Pedro Pinula"],
  "Jutiapa": ["Agua Blanca","Asunción Mita","Atescatempa","Comapa","Conguaco","El Adelanto","Jalpatagua","Jerez","Jutiapa","Moyuta","Pasaco","Quesada","San José Acatempa","Santa Catarina Mita","Yupiltepeque","Zapotitlán"],
  "Petén": ["Dolores","El Chal","Flores","La Libertad","Las Cruces","Melchor de Mencos","Poptún","San Andrés","San Benito","San Francisco","San José","San Luis","Santa Ana","Sayaxché"],
  "Quetzaltenango": ["Almolonga","Cabricán","Cajolá","Cantel","Coatepeque","Colomba","Concepción Chiquirichapa","El Palmar","Flores Costa Cuca","Génova","Huitán","La Esperanza","Mcpal. de Quetzaltenango","Olintepeque","Palestina de los Altos","Salcajá","San Carlos Sija","San Francisco La Unión","San Juan Ostuncalco","San Marcos Atitán","San Martín Sacatepéquez","San Mateo","San Miguel Sigüilá","Sibilia","Zunil"],
  "Quiché": ["Canillá","Chicamán","Chiché","Chichicastenango","Chinique","Cunén","Ixcán","Joyabaj","Nebaj","Pachalum","Patzité","Sacapulas","San Andrés Sajcabajá","San Antonio Ilotenango","San Bartolomé Jocotenango","San Juan Cotzal","San Pedro Jocopilas","Santa Cruz del Quiché","Uspantán","Zacualpa"],
  "Retalhuleu": ["Champerico","El Asintal","Nuevo San Carlos","Retalhuleu","San Andrés Villa Seca","San Felipe","San Martín Zapotitlán","San Sebastián","Santa Cruz Muluá"],
  "Sacatepéquez": ["Alotenango","Antigua Guatemala","Ciudad Vieja","Jocotenango","Magdalena Milpas Altas","Pastores","San Antonio Aguas Calientes","San Bartolomé Milpas Altas","San Lucas Sacatepéquez","San Miguel Dueñas","Santa Catarina Barahona","Santa Lucía Milpas Altas","Santa María de Jesús","Santiago Sacatepéquez","Santo Domingo Xenacoj","Sumpango"],
  "San Marcos": ["Ayutla","Catarina","Comitancillo","Concepción Tutuapa","El Quetzal","El Rodeo","El Tumbador","Esquipulas Palo Gordo","Ixchiguán","La Blanca","La Reforma","Malacatán","Nuevo Progreso","Ocos","Pajapita","Río Blanco","Sacatepéquez","San Antonio Sacatepéquez","San Cristóbal Cucho","San José El Rodeo","San Lorenzo","San Marcos","San Miguel Ixtahuacán","San Pablo","San Pedro Sacatepéquez","San Rafael Pie de la Cuesta","Sibinal","Sipacapa","Tacaná","Tajumulco","Tejutla"],
  "Santa Rosa": ["Barberena","Casillas","Chiquimulilla","Cuilapa","Guazacapán","Nueva Santa Rosa","Oratorio","Pueblo Nuevo Viñas","San Juan Tecuaco","San Rafael Las Flores","Santa Cruz Naranjo","Santa María Ixhuatán","Santa Rosa de Lima","Taxisco"],
  "Sololá": ["Concepción","Nahualá","Panajachel","San Andrés Semetabaj","San Antonio Palopó","San José Chacayá","San Juan La Laguna","San Lucas Tolimán","San Marcos La Laguna","San Pablo La Laguna","San Pedro La Laguna","Santa Catarina Ixtahuacán","Santa Catarina Palopó","Santa Clara La Laguna","Santa Cruz La Laguna","Santa Lucía Utatlán","Santa María Visitación","Santiago Atitlán","Sololá"],
  "Suchitepéquez": ["Chicacao","Cuyotenango","Mazatenango","Patulul","Pueblo Nuevo","Río Bravo","Samayac","San Antonio Suchitepéquez","San Bernardino","San Francisco Zapotitlán","San Gabriel","San José El Ídolo","San Juan Bautista","San Lorenzo","San Miguel Panán","Santa Bárbara","Santo Domingo Suchitepéquez","Santo Tomás La Unión","Zunilito"],
  "Totonicapán": ["Momostenango","San Andrés Xecul","San Bartolo","San Cristóbal Totonicapán","San Francisco El Alto","Santa Lucía La Reforma","Santa María Chiquimula","Totonicapán"],
  "Zacapa": ["Cabañas","Estanzuela","Gualán","Huité","La Unión","Río Hondo","San Diego","San Jorge","Teculután","Usumatlán","Zacapa"],
};

const ENVIO = 25;

function Cart({ isOpen, onClose, cartItems, onAdd, onRemove, onDelete }) {
  const [step, setStep] = useState("cart");
  const [form, setForm] = useState({ nombre: "", telefono: "", departamento: "", municipio: "", direccion: "" });
  const [errors, setErrors] = useState({});

  const subtotal = cartItems.reduce((sum, item) => sum + item.precio * item.quantity, 0);
  const total = subtotal + ENVIO;

  const municipios = form.departamento ? DEPARTAMENTOS_MUNICIPIOS[form.departamento] : [];

  function handleClose() {
    setStep("cart");
    setErrors({});
    onClose();
  }

  function validate() {
    const newErrors = {};
    if (!form.nombre.trim()) newErrors.nombre = "Tu nombre es requerido";
    if (!form.telefono.trim()) newErrors.telefono = "Tu teléfono es requerido";
    if (!form.departamento) newErrors.departamento = "Selecciona un departamento";
    if (!form.municipio) newErrors.municipio = "Selecciona un municipio";
    if (!form.direccion.trim()) newErrors.direccion = "La dirección es requerida";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function buildOrderMessage() {
    const productLines = cartItems.map(
      (item) => `- ${item.nombre} x${item.quantity} (${formatPrice(item.precio * item.quantity)})`
    ).join("\n");

    return `Hola! Quiero hacer un pedido en Casa San Antonio.\n\nMi nombre es ${form.nombre} y mi numero de telefono es ${form.telefono}. Quisiera que me envien lo siguiente:\n\n${productLines}\n\nSubtotal: ${formatPrice(subtotal)}\nEnvio: ${formatPrice(ENVIO)}\nTotal: ${formatPrice(total)}\n\nMi direccion de entrega es: ${form.direccion}, ${form.municipio}, ${form.departamento}.\n\nPago contra entrega por Forza. Gracias!`;
  }

  function handleSendOrder() {
    if (!validate()) return;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildOrderMessage())}`;
    window.open(url, "_blank");
  }

  const selectClass = (field) =>
    `w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-amber-700 bg-white ${errors[field] ? "border-red-400 bg-red-50" : "border-stone-300"}`;

  return (
    <>
      {isOpen && <div onClick={handleClose} className="fixed inset-0 z-40 bg-black/40" />}

      <aside className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md transform flex-col bg-white shadow-2xl transition-transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-stone-200 p-5">
          <div className="flex items-center gap-3">
            {step === "form" && (
              <button onClick={() => setStep("cart")} className="rounded-full bg-stone-100 p-2 text-stone-700 hover:bg-stone-200">
                ←
              </button>
            )}
            <div>
              <p className="text-sm font-semibold text-amber-700">{step === "cart" ? "Resumen" : "Datos de entrega"}</p>
              <h2 className="text-2xl font-black text-stone-950">{step === "cart" ? "Carrito" : "Tu pedido"}</h2>
            </div>
          </div>
          <button onClick={handleClose} className="rounded-full bg-stone-100 p-3 text-stone-900 hover:bg-stone-200">
            <X size={20} />
          </button>
        </div>

        {/* STEP 1 — Lista de productos */}
        {step === "cart" && (
          <>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5 pb-6">
              {cartItems.length === 0 ? (
                <div className="rounded-3xl bg-stone-50 p-6 text-center text-stone-600">
                  Tu carrito está vacío. Agrega productos para hacer tu pedido.
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 rounded-3xl border border-stone-200 p-3">
                    <img src={item.imagen} alt={item.nombre} className="h-20 w-20 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-stone-950">{item.nombre}</p>
                          <p className="text-sm text-stone-600">{formatPrice(item.precio)}</p>
                        </div>
                        <button onClick={() => onDelete(item.id)} className="rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button onClick={() => onRemove(item.id)} className="rounded-full bg-stone-100 p-2 hover:bg-stone-200">
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <button onClick={() => onAdd(item)} className="rounded-full bg-stone-100 p-2 hover:bg-stone-200">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="shrink-0 border-t border-stone-200 bg-white p-5 shadow-[0_-12px_30px_rgba(0,0,0,0.08)]">
              <div className="mb-1 flex items-center justify-between text-sm text-stone-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="mb-3 flex items-center justify-between text-sm text-stone-600">
                <span>Envío (Forza)</span>
                <span>{formatPrice(ENVIO)}</span>
              </div>
              <div className="mb-4 flex items-center justify-between border-t border-stone-200 pt-3 text-lg font-black text-stone-950">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <button
                onClick={() => cartItems.length && setStep("form")}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-base font-black text-white shadow-lg transition ${cartItems.length ? "bg-stone-950 hover:bg-amber-800" : "cursor-not-allowed bg-stone-300"}`}
              >
                Continuar con el pedido →
              </button>
            </div>
          </>
        )}

        {/* STEP 2 — Formulario */}
        {step === "form" && (
          <>
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">

              {/* Resumen compacto */}
              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone-500">Resumen del pedido</p>
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-stone-700">
                    <span>{item.nombre} x{item.quantity}</span>
                    <span className="font-semibold">{formatPrice(item.precio * item.quantity)}</span>
                  </div>
                ))}
                <div className="mt-2 flex justify-between border-t border-stone-200 pt-2 text-sm text-stone-600">
                  <span>Envío (Forza)</span>
                  <span>{formatPrice(ENVIO)}</span>
                </div>
                <div className="mt-1 flex justify-between font-black text-stone-950">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Campos */}
              <div className="flex flex-col gap-4">
                <p className="text-sm text-stone-500">Ingresa tus datos para coordinar la entrega por <span className="font-semibold text-stone-700">Forza</span>.</p>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-stone-700">Nombre completo *</label>
                  <input
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej. María García"
                    className={selectClass("nombre")}
                  />
                  {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-stone-700">Teléfono *</label>
                  <input
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    placeholder="Ej. 5555-1234"
                    type="tel"
                    className={selectClass("telefono")}
                  />
                  {errors.telefono && <p className="mt-1 text-xs text-red-500">{errors.telefono}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-stone-700">Departamento *</label>
                  <select
                    value={form.departamento}
                    onChange={(e) => setForm({ ...form, departamento: e.target.value, municipio: "" })}
                    className={selectClass("departamento")}
                  >
                    <option value="">-- Selecciona departamento --</option>
                    {Object.keys(DEPARTAMENTOS_MUNICIPIOS).sort().map((dep) => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                  {errors.departamento && <p className="mt-1 text-xs text-red-500">{errors.departamento}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-stone-700">Municipio *</label>
                  <select
                    value={form.municipio}
                    onChange={(e) => setForm({ ...form, municipio: e.target.value })}
                    disabled={!form.departamento}
                    className={`${selectClass("municipio")} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <option value="">-- Selecciona municipio --</option>
                    {municipios.map((mun) => (
                      <option key={mun} value={mun}>{mun}</option>
                    ))}
                  </select>
                  {errors.municipio && <p className="mt-1 text-xs text-red-500">{errors.municipio}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-stone-700">Dirección exacta *</label>
                  <input
                    value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                    placeholder="Ej. 5a Calle 3-20, Zona 1"
                    className={selectClass("direccion")}
                  />
                  {errors.direccion && <p className="mt-1 text-xs text-red-500">{errors.direccion}</p>}
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-stone-200 bg-white p-5 shadow-[0_-12px_30px_rgba(0,0,0,0.08)]">
              <button
                onClick={handleSendOrder}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-4 text-base font-black text-white shadow-lg transition hover:bg-green-700"
              >
                <MessageCircle size={20} /> Enviar pedido por WhatsApp
              </button>
              <p className="mt-3 text-center text-xs text-stone-400">Te contactaremos para confirmar y coordinar el pago.</p>
            </div>
          </>
        )}

      </aside>
    </>
  );
}

function WhatsAppButton({ hidden = false }) {
  if (hidden) return null;

  return (
    <a
      href={buildWhatsAppUrl()}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-xl transition hover:scale-105 hover:bg-green-700"
      aria-label="Consultar por WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
}

function Footer() {
  return (
    <footer id="contacto" className="mt-16 bg-stone-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <h2 className="text-2xl font-black">Casa San Antonio.</h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-stone-300">
            Tienda online de ponchitos, almohadas, toallas, cobertores, edredones, sábanas y cortinas.
          </p>
        </div>
        <div>
          <h3 className="mb-3 font-bold">Contacto</h3>
          <p className="text-sm text-stone-300">WhatsApp: +502 4018-2873</p>
          <p className="text-sm text-stone-300">Guatemala</p>
        </div>
        <div>
          <h3 className="mb-3 font-bold">Síguenos</h3>
          <div className="flex gap-3">
            <a
              href="https://www.instagram.com/beautystoregt03?igsh=MWxqdjJsNG9hdzg4Mg=="
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-pink-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a
              href="https://www.instagram.com/beautystoregt03?igsh=MWxqdjJsNG9hdzg4Mg=="
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-blue-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-stone-400">
        © 2026 Casa San Antonio. Todos los derechos reservados.
      </div>
    </footer>
  );
}

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortOrder, setSortOrder] = useState("recent");
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(SHEET_CSV_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Error de red.");
        return res.text();
      })
      .then((text) => {
        const productos = parseCSV(text);
        setProductsData(productos);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando productos:", err);
        setError("No se pudo cargar el catálogo. Intenta recargar la página.");
        setLoading(false);
      });
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...productsData];

    if (selectedCategory !== "Todos") {
      result = result.filter((product) => product.categoria === selectedCategory);
    }

    if (sortOrder === "low-high") {
      result.sort((a, b) => a.precio - b.precio);
    }

    if (sortOrder === "high-low") {
      result.sort((a, b) => b.precio - a.precio);
    }

    if (sortOrder === "recent") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [selectedCategory, sortOrder, productsData]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(product) {
    setCartItems((currentItems) => {
      const existing = currentItems.find((item) => item.id === product.id);

      if (existing) {
        return currentItems.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }

      return [...currentItems, { ...product, quantity: 1 }];
    });
  }

  function removeFromCart(productId) {
    setCartItems((currentItems) =>
      currentItems
        .map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  }

  function deleteFromCart(productId) {
    setCartItems((currentItems) => currentItems.filter((item) => item.id !== productId));
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <TopBar />
      <Header
        cartCount={cartCount}
        onCartOpen={() => setIsCartOpen(true)}
        onNavigate={(category) => {
          setSelectedCategory(category);
          setTimeout(() => {
            document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" });
          }, 50);
        }}
      />
      <CategoryHighlights selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

      <section id="productos" className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Catálogo</p>
            <h2 className="text-3xl font-black text-stone-950">Productos disponibles</h2>
            <p className="mt-2 text-stone-600">Selecciona una categoría o consulta directamente por WhatsApp.</p>
          </div>
          <p className="rounded-full bg-white px-4 py-2 text-sm font-bold text-stone-700 shadow-sm">
            {filteredProducts.length} productos
          </p>
        </div>

        <CategoryFilter
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        {loading && (
          <div className="py-20 text-center text-stone-500">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-amber-700" />
            Cargando productos...
          </div>
        )}
        {error && (
          <div className="rounded-3xl bg-red-50 p-6 text-center text-red-600">{error}</div>
        )}
        {!loading && !error && <ProductGrid products={filteredProducts} allProducts={productsData} onAddToCart={addToCart} />}
      </section>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onDelete={deleteFromCart}
      />

      <WhatsAppButton hidden={isCartOpen} />
      <Footer />
    </main>
  );
}