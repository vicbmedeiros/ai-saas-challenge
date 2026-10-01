import "dotenv/config";
import bcrypt from "bcryptjs";

import { connectDatabase } from "../config/database";
import { Company } from "../models/Company";
import { User } from "../models/User";
import { Product } from "../models/Product";

async function seed() {
  await connectDatabase();

  await Promise.all([
    Company.deleteMany({}),
    User.deleteMany({}),
    Product.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("123456", 12);

  const techStore = await Company.create({
    name: "Tech Store",
  });

  const beautyStore = await Company.create({
    name: "Beauty Store",
  });

  await User.create([
    {
      name: "Admin Tech",
      email: "admin@techstore.com",
      passwordHash,
      role: "admin",
      company_id: techStore._id,
    },
    {
      name: "User Tech",
      email: "user@techstore.com",
      passwordHash,
      role: "user",
      company_id: techStore._id,
    },
    {
      name: "Admin Beauty",
      email: "admin@beautystore.com",
      passwordHash,
      role: "admin",
      company_id: beautyStore._id,
    },
    {
      name: "User Beauty",
      email: "user@beautystore.com",
      passwordHash,
      role: "user",
      company_id: beautyStore._id,
    },
  ]);

  const techProducts = [
    {
      name: "Fone Bluetooth JBL Tune 520",
      description:
        "Fone de ouvido Bluetooth sem fio com bateria de longa duração e microfone integrado.",
      price: 249.9,
      category: "Áudio",
      imageUrl: "https://picsum.photos/seed/jbl-tune-520/400/300",
      company_id: techStore._id,
    },
    {
      name: "Headset Gamer HyperX Cloud Stinger",
      description:
        "Headset gamer com microfone, som estéreo e estrutura leve para longas sessões.",
      price: 329.9,
      category: "Áudio",
      imageUrl: "https://picsum.photos/seed/hyperx-headset/400/300",
      company_id: techStore._id,
    },
    {
      name: "Teclado Mecânico Redragon Kumara",
      description:
        "Teclado mecânico compacto com iluminação RGB e switches de resposta rápida.",
      price: 289.9,
      category: "Periféricos",
      imageUrl: "https://picsum.photos/seed/redragon-kumara/400/300",
      company_id: techStore._id,
    },
    {
      name: "Mouse Logitech G305",
      description:
        "Mouse gamer sem fio com sensor de alta precisão e baixo consumo de bateria.",
      price: 219.9,
      category: "Periféricos",
      imageUrl: "https://picsum.photos/seed/logitech-g305/400/300",
      company_id: techStore._id,
    },
    {
      name: "Mouse Sem Fio Logitech M170",
      description:
        "Mouse compacto sem fio para uso diário, com conexão USB e bateria de longa duração.",
      price: 89.9,
      category: "Periféricos",
      imageUrl: "https://picsum.photos/seed/logitech-m170/400/300",
      company_id: techStore._id,
    },
    {
      name: "Webcam Logitech C920",
      description:
        "Webcam Full HD 1080p com microfone integrado para reuniões e videochamadas.",
      price: 449.9,
      category: "Acessórios",
      imageUrl: "https://picsum.photos/seed/logitech-c920/400/300",
      company_id: techStore._id,
    },
    {
      name: "Monitor LG UltraGear 24",
      description:
        "Monitor gamer de 24 polegadas com alta taxa de atualização e baixa latência.",
      price: 1099.9,
      category: "Monitores",
      imageUrl: "https://picsum.photos/seed/lg-ultragear-24/400/300",
      company_id: techStore._id,
    },
    {
      name: "SSD Kingston NV2 1TB",
      description:
        "SSD NVMe de 1TB com alta velocidade de leitura e gravação para notebooks e desktops.",
      price: 399.9,
      category: "Armazenamento",
      imageUrl: "https://picsum.photos/seed/kingston-nv2/400/300",
      company_id: techStore._id,
    },
    {
      name: "Hub USB-C 6 em 1",
      description:
        "Hub USB-C com HDMI, USB 3.0, leitor de cartão e carregamento USB-C.",
      price: 179.9,
      category: "Acessórios",
      imageUrl: "https://picsum.photos/seed/hub-usbc/400/300",
      company_id: techStore._id,
    },
    {
      name: "Suporte Articulado para Monitor",
      description:
        "Suporte de mesa articulado para monitor com ajuste de altura, inclinação e rotação.",
      price: 199.9,
      category: "Acessórios",
      imageUrl: "https://picsum.photos/seed/monitor-arm/400/300",
      company_id: techStore._id,
    },
    {
      name: "Carregador USB-C 65W",
      description:
        "Carregador rápido USB-C de 65W compatível com notebooks, tablets e smartphones.",
      price: 159.9,
      category: "Acessórios",
      imageUrl: "https://picsum.photos/seed/charger-65w/400/300",
      company_id: techStore._id,
    },
    {
      name: "Notebook Lenovo IdeaPad 3",
      description:
        "Notebook para produtividade com 8GB de RAM, SSD de 256GB e tela de 15,6 polegadas.",
      price: 2899.9,
      category: "Notebooks",
      imageUrl: "https://picsum.photos/seed/lenovo-ideapad/400/300",
      company_id: techStore._id,
    },
  ];

  const beautyProducts = [
    {
      name: "Sérum Vitamina C 10%",
      description:
        "Sérum facial antioxidante com vitamina C para ajudar na luminosidade e uniformização da pele.",
      price: 89.9,
      category: "Skincare",
      imageUrl: "https://picsum.photos/seed/vitamin-c-serum/400/300",
      company_id: beautyStore._id,
    },
    {
      name: "Ácido Hialurônico Facial",
      description:
        "Sérum hidratante com ácido hialurônico para auxiliar na hidratação profunda da pele.",
      price: 74.9,
      category: "Skincare",
      imageUrl: "https://picsum.photos/seed/hyaluronic-acid/400/300",
      company_id: beautyStore._id,
    },
    {
      name: "Protetor Solar Facial FPS 60",
      description:
        "Protetor solar facial de alta proteção com textura leve e rápida absorção.",
      price: 69.9,
      category: "Skincare",
      imageUrl: "https://picsum.photos/seed/sunscreen-fps60/400/300",
      company_id: beautyStore._id,
    },
    {
      name: "Gel de Limpeza Facial",
      description:
        "Gel de limpeza suave para remoção de impurezas, oleosidade e resíduos de maquiagem.",
      price: 49.9,
      category: "Skincare",
      imageUrl: "https://picsum.photos/seed/facial-cleanser/400/300",
      company_id: beautyStore._id,
    },
    {
      name: "Hidratante Facial Oil Free",
      description:
        "Hidratante facial leve, sem óleo, indicado para peles mistas e oleosas.",
      price: 59.9,
      category: "Skincare",
      imageUrl: "https://picsum.photos/seed/oil-free-moisturizer/400/300",
      company_id: beautyStore._id,
    },
    {
      name: "Base Líquida Matte",
      description:
        "Base líquida de acabamento matte e cobertura média para maquiagem de longa duração.",
      price: 79.9,
      category: "Maquiagem",
      imageUrl: "https://picsum.photos/seed/matte-foundation/400/300",
      company_id: beautyStore._id,
    },
    {
      name: "Batom Matte Nude",
      description:
        "Batom matte de longa duração com acabamento confortável e tonalidade nude.",
      price: 39.9,
      category: "Maquiagem",
      imageUrl: "https://picsum.photos/seed/nude-lipstick/400/300",
      company_id: beautyStore._id,
    },
    {
      name: "Máscara de Cílios Volume",
      description:
        "Máscara para cílios com efeito de volume e definição.",
      price: 44.9,
      category: "Maquiagem",
      imageUrl: "https://picsum.photos/seed/mascara-volume/400/300",
      company_id: beautyStore._id,
    },
    {
      name: "Paleta de Sombras Neutras",
      description:
        "Paleta com tons neutros para maquiagem diária e produções mais elaboradas.",
      price: 99.9,
      category: "Maquiagem",
      imageUrl: "https://picsum.photos/seed/neutral-eyeshadow/400/300",
      company_id: beautyStore._id,
    },
    {
      name: "Blush Compacto Rosé",
      description:
        "Blush compacto em tom rosé com acabamento natural.",
      price: 54.9,
      category: "Maquiagem",
      imageUrl: "https://picsum.photos/seed/rose-blush/400/300",
      company_id: beautyStore._id,
    },
    {
      name: "Óleo Reparador Capilar",
      description:
        "Óleo capilar para redução de frizz, brilho e proteção das pontas.",
      price: 64.9,
      category: "Cabelos",
      imageUrl: "https://picsum.photos/seed/hair-oil/400/300",
      company_id: beautyStore._id,
    },
    {
      name: "Máscara de Hidratação Capilar",
      description:
        "Máscara de tratamento para hidratação e recuperação de cabelos ressecados.",
      price: 84.9,
      category: "Cabelos",
      imageUrl: "https://picsum.photos/seed/hair-mask/400/300",
      company_id: beautyStore._id,
    },
  ];

  await Product.insertMany([
    ...techProducts,
    ...beautyProducts,
  ]);

  console.log("Seed completed");
  console.log("");
  console.log("Tech Store");
  console.log("admin@techstore.com / 123456");
  console.log("user@techstore.com / 123456");
  console.log("");
  console.log("Beauty Store");
  console.log("admin@beautystore.com / 123456");
  console.log("user@beautystore.com / 123456");

  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});