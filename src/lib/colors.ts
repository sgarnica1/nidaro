export type ColorOption = {
  name: string;
  value: string;
};

export const EXPENSE_COLORS: ColorOption[] = [
  // Reds & Pinks (muted)
  { name: "Rosa polvo", value: "#E8C4C4" },
  { name: "Coral suave", value: "#E8B8A8" },
  { name: "Terracota", value: "#D4A99C" },
  { name: "Rosa salmón", value: "#F0C4B8" },
  { name: "Frambuesa", value: "#E8B8C4" },

  // Oranges & Yellows (warm earth)
  { name: "Durazno", value: "#F5D4B8" },
  { name: "Albaricoque", value: "#F0C9A8" },
  { name: "Miel", value: "#E8D4A8" },
  { name: "Arena dorada", value: "#E6D9B8" },
  { name: "Beige cálido", value: "#E0D4C4" },

  // Greens (nature)
  { name: "Sage", value: "#B8C9B8" },
  { name: "Menta suave", value: "#B8D4C4" },
  { name: "Eucalipto", value: "#A8C9B8" },
  { name: "Oliva", value: "#C4D4A8" },
  { name: "Musgo", value: "#B8C4A8" },

  // Blues (sky & water)
  { name: "Cielo", value: "#B8D4E8" },
  { name: "Azul polvo", value: "#B8C9E0" },
  { name: "Lavanda azul", value: "#C4C9E8" },
  { name: "Periwinkle", value: "#C9C4E8" },
  { name: "Azul pálido", value: "#B8D4F0" },

  // Purples & Violets
  { name: "Lavanda", value: "#D4C4E8" },
  { name: "Lila", value: "#E0C9E8" },
  { name: "Orquídea", value: "#E8C4E0" },
  { name: "Violeta suave", value: "#D9C4E6" },
  { name: "Malva", value: "#E6C9E0" },

  // Neutrals & Earth
  { name: "Taupe", value: "#C9C4B8" },
  { name: "Arena", value: "#D9D4C9" },
  { name: "Gris cálido", value: "#D4D4D4" },
  { name: "Beige", value: "#E0D9D4" },
  { name: "Crema", value: "#E8E0D4" },
];
