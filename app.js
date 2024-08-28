const express = require("express");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const db = require("./models");
const PESANAN = db.pesanan;
const uploadConfig = require("./uploadConfig");
const cors = require("cors");
require("dotenv").config();

const app = express();
connectDB();
const fields = uploadConfig.upload.fields([
  {
    name: "buktiTransfer",
    maxCount: 1,
  },
  {
    name: "uploadDesign",
    maxCount: 1,
  },
  {
    name: "namanomorpembuatan",
    maxCount: 1,
  },
]);

// CORS configuration
const corsOptions = {
  origin: "*",
};

app.use("/gambar", express.static("static"));

app.use(express.json());
app.use(cors());

app.use(
  express.urlencoded({
    enableTypes: ["json", "form"],
    extended: true,
  })
);
app.use(
  express.json({
    extended: true,
  })
);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/uploadBukti", fields, async (req, res) => {
  try {
    const {
      username,
      nama_lengkap,
      alamat,
      kota,
      noTelp,
      email,
      ukuran,
      jenis_bahan,
      jenis_font,
      jenis_kerah,
      jumlahBaju,
      totalHarga,
    } = req.body;
    console.log(req.body);
    const transaksi = new PESANAN({
      username,
      nama_lengkap,
      noTelp,
      alamat,
      kota,
      email,
      ukuran,
      jenis_bahan,
      jenis_font,
      jenis_kerah,
      jumlahBaju: parseInt(jumlahBaju),
      totalHarga: parseInt(totalHarga),
      buktiTransfer: req.files.buktiTransfer
        ? req.files.buktiTransfer[0].filename
        : null,
      uploadDesign: req.files.uploadDesign
        ? req.files.uploadDesign[0].filename
        : null,
      namanomorpembuatan: req.files.namanomorpembuatan
        ? req.files.namanomorpembuatan[0].filename
        : null,
    });

    await transaksi.save();
    console.log("Berhasil Save");
    res.status(201).json({
      message: "Transaksi berhasil disimpan!",
      statusCode: 201,
      transaksi: transaksi, // Kirimkan data transaksi yang baru saja disimpan
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat menyimpan transaksi." });
  }
});

// Route to get transaction by ID
app.get("/transaksi/:id", async (req, res) => {
  console.log(`Menerima permintaan untuk ID: ${req.params.id}`);
  try {
    const transaksi = await PESANAN.findById(req.params.id);
    if (!transaksi) {
      console.log("Transaksi tidak ditemukan");
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }
    console.log("Transaksi ditemukan:", transaksi);
    res.json(transaksi);
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengambil transaksi." });
  }
});

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// Routes
require("./routes/mahasiswa.routes")(app);
require("./routes/pesanan.routes")(app);
require("./routes/produk.routes")(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
