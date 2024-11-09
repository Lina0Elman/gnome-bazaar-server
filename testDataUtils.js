const randomBetween = (a, b) => {
  return Math.floor(Math.random() * (b - a + 1)) + a;
};

const randomString = (n) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < n; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};

const randomRole = () => {
  const options = ["Admin", "Supplier", "User"];
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
};

const randomCategory = () => {
  const options = ["Accessories", "Gnome", "Hat", "Pants", "Shirt", "Shoes"];
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
};

const randomDate = () => {
  const date = randomBetween(1, 28);
  const month = randomBetween(0, 11);
  const year = randomBetween(2018, 2024);
  return new Date(year, month, date);
};


const hats = [
  "Hat1.webp",
  "Hat2.webp",
  "Hat3.webp",
  "Hat4.webp",
  "Hat5.webp"
];
const accessories = [
  "magicWand1.webp",
  "magicWand2.webp",
  "magicWand3.webp",
  "magicWand4.webp",
  "magicWand5.webp",
  "acc1.jpeg",
  "acc2.jpeg",
  "acc3.jpeg",
  "acc4.jpeg",
  "Scarf1.webp",
  "Scarf2.webp",
  "Scarf3.webp",
  "Scarf4.webp",
  "Scarf5.webp"
];
const pants = [
  "Pants1.webp",
  "Pants2.webp",
  "Pants3.webp",
  "Pants4.webp",
  "Pants5.webp"
];
const shirts = [
  "Shirt1.webp",
  "Shirt2.webp",
  "Shirt3.webp",
  "Shirt4.webp",
  "Shirt5.webp"
];
const shoes = [
  "Shoes1.webp",
  "Shoes2.webp",
  "Shoes3.webp",
  "Shoes4.webp",
  "Shoes5.webp"
];

const gnomes = [
  "gnome1.webp",
  "gnome2.webp",
  "gnome3.webp",
  "gnome4.webp",
  "gnome5.webp",
  "gnome6.webp",
  "gnome7.webp",
  "gnome8.webp",
  "gnome9.webp",
  "gnome10.webp",
  "Beard1.webp",
  "Beard2.webp",
  "Beard3.webp",
  "Beard4.webp",
  "Beard5.webp",
  "Gnome11.jpeg",
  "Gnome12.jpeg",
  "Gnome13.jpeg",
  "Gnome14.jpeg"
];

const categories = ["Accessories", "Gnome", "Hat", "Pants", "Shirt", "Shoes"];

const randomImage = (category) => {
  if (category == "Gnome") {
    return `./src/public/assets/${gnomes[randomBetween(0, gnomes.length - 1)]}`;
  }
  if (category == "Hat") {
    return `./src/public/assets/${hats[randomBetween(0, hats.length - 1)]}`;
  }
  if (category == "Accessories") {
    return `./src/public/assets/${accessories[randomBetween(0, accessories.length - 1)]}`;
  }
  if (category == "Pants") {
    return `./src/public/assets/${pants[randomBetween(0, pants.length - 1)]}`;
  }
  if (category == "Shoes") {
    return `./src/public/assets/${shoes[randomBetween(0, shoes.length - 1)]}`;
  }
  if (category == "Shirt") {
    return `./src/public/assets/${shirts[randomBetween(0, shirts.length - 1)]}`;
  }
};

module.exports = {
  randomBetween,
  randomString,
  randomRole,
  randomDate,
  randomCategory,
  randomImage,
  categories,
};
