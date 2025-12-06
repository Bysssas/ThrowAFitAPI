import Item from "../models/Item.js";

// Clothing type detection (based on item *name*, not category field)
const typeRules = {
  tops: /(top|shirt|hoodie|blouse|jacket|tshirt|sando)/i,
  bottoms: /(pants|shorts|jeans|skirt|bottom|trousers|joggers)/i,
  shoes: /(shoes|sneakers|boots|heels|slippers)/i,
  accessories: /(hat|cap|necklace|bracelet|earrings|ring|bag|accessory)/i
};

// Helper: check if name contains any selected filter
const matchesFilter = (name, options) => {
  const lower = name.toLowerCase();

  if (!options.fullRandom) {
    if (options.colors?.length) {
      const colorMatch = options.colors.some(c => lower.includes(c.toLowerCase()));
      if (!colorMatch) return false;
    }
    if (options.patterns?.length) {
      const patternMatch = options.patterns.some(p => lower.includes(p.toLowerCase()));
      if (!patternMatch) return false;
    }
    if (options.styles?.length) {
      const styleMatch = options.styles.some(s => lower.includes(s.toLowerCase()));
      if (!styleMatch) return false;
    }
  }

  return true;
};

export const generateFit = async (req, res) => {
  try {
    const options = req.body;  // { fullRandom, colors, patterns, styles }
    const userId = req.user.id;

    const allItems = await Item.find({ user: userId });

    // Filter based on color/pattern/style
    const filtered = allItems.filter(item => matchesFilter(item.name, options));

    // Categorize by type rules
    const buckets = {
      tops: [],
      bottoms: [],
      shoes: [],
      accessories: []
    };

    filtered.forEach(item => {
      for (const type in typeRules) {
        if (typeRules[type].test(item.name)) {
          buckets[type].push(item);
        }
      }
    });

    // Random selection
    const pickRandom = arr =>
      arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;

    const outfit = {
      top: pickRandom(buckets.tops),
      bottom: pickRandom(buckets.bottoms),
      shoes: pickRandom(buckets.shoes),
      accessory: pickRandom(buckets.accessories)
    };

    res.json({ outfit });

  } catch (err) {
    console.error("GenerateFit Error:", err);
    res.status(500).json({ message: "Server error generating fit." });
  }
};
