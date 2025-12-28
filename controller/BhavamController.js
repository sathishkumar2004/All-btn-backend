const { Bhavam } = require("../models");

/* ============================
   1. GET ALL BHAVAM
============================ */
exports.getAllBhavam = async (req, res) => {
  try {
    const data = await Bhavam.findAll();
    res.status(200).json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    console.error("getAllBhavam error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

/* ============================
   2. GET BHAVAM BY ID (includes ALL dic items)
============================ */
exports.getBhavamById = async (req, res) => {
  try {
    const { id } = req.params;
    const bhavam = await Bhavam.findByPk(id);

    if (!bhavam) {
      return res.status(404).json({ error: "Bhavam not found" });
    }

    // Ensure dic is an array
    const dicArray = Array.isArray(bhavam.dic) ? bhavam.dic : [];

    res.status(200).json({
      success: true,
      data: {
        id: bhavam.id,
        bhavam: bhavam.bhavam, // This is an INTEGER field
        dic: dicArray,
        totalItems: dicArray.length,
        // Include indices for easy reference
        dicItems: dicArray.map((item, index) => ({
          ...item,
          index: index
        }))
      }
    });
  } catch (error) {
    console.error("getBhavamById error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

/* ============================
   3. ADD DIC ITEM
============================ */
exports.addDicItem = async (req, res) => {
  try {
    console.log("➕ ADD DIC ITEM REQUEST (Bhavam):", req.body);
    
    const { id } = req.params;
    const { text, cat } = req.body;

    // Validate input
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({
        error: "text is required and must be a non-empty string"
      });
    }

    if (!cat) {
      return res.status(400).json({ error: "cat is required" });
    }

    // Convert cat to array and validate
    const catArray = Array.isArray(cat) ? cat : [cat];
    const catNumbers = catArray.map(c => Number(c)).filter(c => !isNaN(c));
    
    if (catNumbers.length === 0) {
      return res.status(400).json({ error: "cat must contain valid numbers" });
    }

    const bhavam = await Bhavam.findByPk(id);
    if (!bhavam) {
      return res.status(404).json({ error: "Bhavam not found" });
    }

    // Initialize dic if not exists
    if (!Array.isArray(bhavam.dic)) {
      bhavam.dic = [];
    }

    // Create new item
    const newItem = {
      text: text.trim(),
      cat: catNumbers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create updated dic array
    const updatedDic = [...bhavam.dic, newItem];
    
    // Save to database
    bhavam.setDataValue('dic', updatedDic);
    await bhavam.save({ fields: ['dic'] });
    await bhavam.reload();

    res.status(201).json({
      success: true,
      message: "Dic item added successfully",
      data: {
        id: bhavam.id,
        newItem: newItem,
        totalItems: bhavam.dic.length
      }
    });
  } catch (error) {
    console.error("❌ addDicItem error (Bhavam):", error);
    res.status(500).json({ error: "Server Error", message: error.message });
  }
};

/* ============================
   4. UPDATE DIC ITEM
============================ */
exports.updateDicItem = async (req, res) => {
  try {
    const { id, index } = req.params;
    const { text, cat } = req.body;
    const indexNum = Number(index);

    if (Number.isNaN(indexNum) || indexNum < 0) {
      return res.status(400).json({ error: "index must be a valid positive number" });
    }

    const bhavam = await Bhavam.findByPk(id);
    if (!bhavam) {
      return res.status(404).json({ error: "Bhavam not found" });
    }

    if (!Array.isArray(bhavam.dic) || indexNum >= bhavam.dic.length) {
      return res.status(400).json({ error: "Invalid index" });
    }

    // Create deep copy
    const updatedDic = JSON.parse(JSON.stringify(bhavam.dic));
    
    let hasChanges = false;
    
    // Update text if provided
    if (text !== undefined) {
      if (typeof text !== 'string' || text.trim() === '') {
        return res.status(400).json({ error: "text must be a non-empty string" });
      }
      const newText = text.trim();
      if (updatedDic[indexNum].text !== newText) {
        updatedDic[indexNum].text = newText;
        hasChanges = true;
      }
    }
    
    // Update cat if provided
    if (cat !== undefined) {
      const catArray = Array.isArray(cat) ? cat : [cat];
      const catNumbers = catArray.map(c => Number(c)).filter(c => !isNaN(c));
      
      if (catNumbers.length === 0) {
        return res.status(400).json({ error: "cat must contain valid numbers" });
      }
      
      // Sort for comparison
      const currentCat = [...(updatedDic[indexNum].cat || [])].sort();
      const newCat = [...catNumbers].sort();
      
      if (JSON.stringify(currentCat) !== JSON.stringify(newCat)) {
        updatedDic[indexNum].cat = catNumbers;
        hasChanges = true;
      }
    }

    if (text === undefined && cat === undefined) {
      return res.status(400).json({ error: "Either text or cat must be provided" });
    }

    if (!hasChanges) {
      return res.json({
        success: true,
        message: "No changes detected"
      });
    }

    // Update timestamp
    updatedDic[indexNum].updatedAt = new Date().toISOString();
    
    // Save to database
    bhavam.setDataValue('dic', updatedDic);
    await bhavam.save({ fields: ['dic'] });
    await bhavam.reload();

    res.json({
      success: true,
      message: "Dic item updated successfully",
      data: {
        id: bhavam.id,
        updatedItem: bhavam.dic[indexNum]
      }
    });
  } catch (error) {
    console.error("❌ updateDicItem error (Bhavam):", error);
    res.status(500).json({ error: "Server Error", message: error.message });
  }
};

/* ============================
   5. DELETE DIC ITEM
============================ */
exports.deleteDicItem = async (req, res) => {
  try {
    const { id, index } = req.params;
    const indexNum = Number(index);

    if (Number.isNaN(indexNum) || indexNum < 0) {
      return res.status(400).json({ error: "index must be a valid positive number" });
    }

    const bhavam = await Bhavam.findByPk(id);
    if (!bhavam) {
      return res.status(404).json({ error: "Bhavam not found" });
    }

    if (!Array.isArray(bhavam.dic) || indexNum >= bhavam.dic.length) {
      return res.status(400).json({ error: "Invalid index" });
    }

    // Get item before deletion
    const deletedItem = bhavam.dic[indexNum];
    
    // Create copy and remove item
    const updatedDic = [...bhavam.dic];
    updatedDic.splice(indexNum, 1);

    // Save to database
    bhavam.setDataValue('dic', updatedDic);
    await bhavam.save({ fields: ['dic'] });
    await bhavam.reload();

    res.json({
      success: true,
      message: "Dic item deleted successfully",
      data: {
        id: bhavam.id,
        deletedItem: deletedItem,
        totalItems: bhavam.dic.length
      }
    });
  } catch (error) {
    console.error("❌ deleteDicItem error (Bhavam):", error);
    res.status(500).json({ error: "Server Error", message: error.message });
  }
};

/* ============================
   6. SEARCH DIC ITEMS
============================ */
exports.searchDicItems = async (req, res) => {
  try {
    const { id } = req.params;
    const { q, cat } = req.query;

    const bhavam = await Bhavam.findByPk(id);
    if (!bhavam) {
      return res.status(404).json({ error: "Bhavam not found" });
    }

    if (!Array.isArray(bhavam.dic) || bhavam.dic.length === 0) {
      return res.json({ success: true, count: 0, data: [] });
    }

    let results = bhavam.dic;

    // Filter by search text
    if (q) {
      const searchTerm = q.toLowerCase();
      results = results.filter(item => 
        item.text && item.text.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by category
    if (cat) {
      const catNum = Number(cat);
      if (!isNaN(catNum)) {
        results = results.filter(item => 
          Array.isArray(item.cat) && item.cat.includes(catNum)
        );
      }
    }

    // Map results with original index
    const mappedResults = results.map(item => {
      const originalIndex = bhavam.dic.indexOf(item);
      return {
        ...item,
        index: originalIndex
      };
    });

    res.json({
      success: true,
      count: mappedResults.length,
      data: mappedResults
    });
  } catch (error) {
    console.error("searchDicItems error (Bhavam):", error);
    res.status(500).json({ error: "Server Error" });
  }
};