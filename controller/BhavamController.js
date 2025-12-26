const { Bhavam } = require("../models");

/* ============================
   BULK CREATE BHAVAM
============================ */
exports.bulkCreateBhavam = async (req, res) => {
  try {
    const bhavams = req.body;

    if (!Array.isArray(bhavams) || bhavams.length === 0) {
      return res.status(400).json({ error: "Invalid Bhavam data" });
    }

    const normalized = bhavams.map(b => ({
      ...b,
      dic: Array.isArray(b.dic)
        ? b.dic.map(d => ({
            text: d.text,
            cat: Array.isArray(d.cat) ? d.cat : [d.cat]
          }))
        : []
    }));

    const inserted = await Bhavam.bulkCreate(normalized, { validate: true });

    res.status(201).json({
      message: "Bhavam bulk insert success",
      data: inserted
    });
  } catch (error) {
    console.error("bulkCreateBhavam error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

/* ============================
   GET ALL BHAVAM
============================ */
exports.getAllBhavam = async (req, res) => {
  try {
    const data = await Bhavam.findAll();
    res.status(200).json(data);
  } catch (error) {
    console.error("getAllBhavam error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

/* ============================
   GET BHAVAM BY ID
============================ */
exports.getBhavamById = async (req, res) => {
  try {
    const { id } = req.params;
    const bhavam = await Bhavam.findByPk(id);

    if (!bhavam) {
      return res.status(404).json({ error: "Bhavam not found" });
    }

    // Ensure dic is an array
    if (!Array.isArray(bhavam.dic)) {
      bhavam.dic = [];
    }

    res.status(200).json(bhavam);
  } catch (error) {
    console.error("getBhavamById error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

/* ============================
   UPDATE FULL dic[]
============================ */
exports.updateBhavamDic = async (req, res) => {
  try {
    const { id } = req.params;
    const { dic } = req.body;

    if (!Array.isArray(dic)) {
      return res.status(400).json({ error: "dic must be an array" });
    }

    const bhavam = await Bhavam.findByPk(id);
    if (!bhavam) {
      return res.status(404).json({ error: "Bhavam not found" });
    }

    // Use setDataValue to force Sequelize to detect change
    bhavam.setDataValue('dic', dic);
    await bhavam.save({ fields: ['dic'] });

    res.json({
      success: true,
      message: "Bhavam dic updated successfully",
      data: bhavam
    });
  } catch (error) {
    console.error("updateBhavamDic error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

/* ============================
   ADD DIC ITEM
============================ */
exports.addDicItem = async (req, res) => {
  try {
    console.log("➕ ADD DIC ITEM REQUEST (Bhavam):", req.params, req.body);
    
    const { id } = req.params;
    const { text, cat } = req.body;

    // Validate input
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({
        error: "text is required and must be a non-empty string"
      });
    }

    if (!Array.isArray(cat) || cat.length === 0) {
      return res.status(400).json({
        error: "cat is required and must be a non-empty array"
      });
    }

    // Convert cat to numbers and validate
    const catArray = cat.map(c => Number(c)).filter(c => !isNaN(c));
    if (catArray.length === 0) {
      return res.status(400).json({
        error: "cat must contain valid numbers"
      });
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
      cat: catArray,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log("📝 Adding new item:", newItem);

    // Create updated dic array
    const updatedDic = [...bhavam.dic, newItem];
    
    // Use setDataValue to force Sequelize to detect change
    bhavam.setDataValue('dic', updatedDic);
    await bhavam.save({ fields: ['dic'] });
    
    // Reload to get fresh data
    await bhavam.reload();

    console.log("✅ Item added successfully. New dic length:", bhavam.dic.length);

    res.status(201).json({
      success: true,
      message: "Dic item added successfully",
      data: {
        id: bhavam.id,
        newItem: newItem,
        dic: bhavam.dic,
        totalItems: bhavam.dic.length
      }
    });
  } catch (error) {
    console.error("❌ addDicItem error:", error);
    res.status(500).json({ 
      error: "Server Error",
      message: error.message 
    });
  }
};

/* ============================
   GET SINGLE DIC ITEM
============================ */
exports.getSingleDic = async (req, res) => {
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
      return res.status(404).json({ error: "Dic item not found" });
    }

    res.status(200).json(bhavam.dic[indexNum]);
  } catch (error) {
    console.error("getSingleDic error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

/* ============================
   UPDATE DIC ITEM
============================ */
exports.updateDicItem = async (req, res) => {
  try {
    console.log("🔧 UPDATE REQUEST RECEIVED (Bhavam):", {
      params: req.params,
      body: req.body,
      fullUrl: req.originalUrl
    });

    // Get parameters
    const { id, index } = req.params;
    const { text, cat } = req.body;
    
    // Convert index to number
    const indexNum = Number(index);
    
    if (Number.isNaN(indexNum) || indexNum < 0) {
      return res.status(400).json({ 
        error: "index must be a valid positive number"
      });
    }

    const bhavam = await Bhavam.findByPk(id);
    if (!bhavam) {
      return res.status(404).json({ error: `Bhavam with id ${id} not found` });
    }
    
    // Initialize dic if not exists
    if (!Array.isArray(bhavam.dic)) {
      bhavam.dic = [];
    }
    
    if (indexNum >= bhavam.dic.length) {
      return res.status(400).json({ 
        error: "Invalid index",
        maxIndex: bhavam.dic.length - 1,
        receivedIndex: indexNum,
        currentLength: bhavam.dic.length
      });
    }

    // Create a DEEP copy
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
        console.log("📝 Text updated to:", newText);
      }
    }
    
    // Update cat if provided
    if (cat !== undefined) {
      if (!Array.isArray(cat) || cat.length === 0) {
        return res.status(400).json({ 
          error: "cat must be a non-empty array" 
        });
      }
      
      // Convert to numbers
      const catArray = cat.map(c => Number(c)).filter(c => !isNaN(c));
      
      if (catArray.length === 0) {
        return res.status(400).json({ 
          error: "cat must contain valid numbers" 
        });
      }
      
      // Sort arrays for comparison
      const currentCat = Array.isArray(updatedDic[indexNum].cat) 
        ? [...updatedDic[indexNum].cat].sort() 
        : [];
      const newCat = [...catArray].sort();
      
      const catChanged = JSON.stringify(currentCat) !== JSON.stringify(newCat);
      
      if (catChanged) {
        updatedDic[indexNum].cat = catArray;
        hasChanges = true;
        console.log("📝 Cat updated to:", catArray);
      }
    }

    // Check if at least one field is provided
    if (text === undefined && cat === undefined) {
      return res.status(400).json({ 
        error: "Either text or cat must be provided for update" 
      });
    }

    if (!hasChanges) {
      console.log("⚠️ No changes detected");
      return res.json({
        success: true,
        message: "No changes detected",
        data: bhavam
      });
    }

    // Update timestamp
    updatedDic[indexNum].updatedAt = new Date().toISOString();
    
    // Use setDataValue to force Sequelize to detect change
    bhavam.setDataValue('dic', updatedDic);
    
    console.log("💾 Saving to database...");
    
    // Save with explicit field
    await bhavam.save({ fields: ['dic'] });
    
    // Reload to get fresh data
    await bhavam.reload();
    
    console.log("✅ Update successful. New item:", updatedDic[indexNum]);

    res.json({
      success: true,
      message: "Dic item updated successfully",
      data: {
        id: bhavam.id,
        updatedItem: bhavam.dic[indexNum],
        dic: bhavam.dic
      }
    });
  } catch (error) {
    console.error("❌ updateDicItem error:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ 
      error: "Server Error",
      message: error.message
    });
  }
};

/* ============================
   DELETE DIC ITEM
============================ */
exports.deleteDicItem = async (req, res) => {
  try {
    console.log("🗑️ DELETE DIC ITEM REQUEST (Bhavam):", req.params);
    
    const { id, index } = req.params;
    const indexNum = Number(index);

    if (Number.isNaN(indexNum) || indexNum < 0) {
      return res.status(400).json({ 
        error: "index must be a valid positive number",
        receivedIndex: index
      });
    }

    const bhavam = await Bhavam.findByPk(id);
    if (!bhavam) {
      return res.status(404).json({ error: `Bhavam with id ${id} not found` });
    }

    // Initialize dic if not exists
    if (!Array.isArray(bhavam.dic)) {
      bhavam.dic = [];
    }

    console.log("📊 Current dic array length:", bhavam.dic.length);

    if (indexNum >= bhavam.dic.length) {
      return res.status(400).json({ 
        error: "Invalid index",
        maxIndex: bhavam.dic.length - 1,
        receivedIndex: indexNum,
        currentLength: bhavam.dic.length
      });
    }

    console.log("🗑️ Deleting item at index", indexNum, ":", bhavam.dic[indexNum]);

    // Create a copy and remove the item
    const updatedDic = [...bhavam.dic];
    updatedDic.splice(indexNum, 1);

    // Use setDataValue to force Sequelize to detect change
    bhavam.setDataValue('dic', updatedDic);
    await bhavam.save({ fields: ['dic'] });
    
    // Reload to get fresh data
    await bhavam.reload();

    console.log("✅ Delete successful. New length:", bhavam.dic.length);

    res.json({
      success: true,
      message: "Dic item deleted successfully",
      data: {
        id: bhavam.id,
        dic: bhavam.dic,
        totalItems: bhavam.dic.length
      }
    });
  } catch (error) {
    console.error("❌ deleteDicItem error:", error);
    res.status(500).json({ 
      error: "Server Error",
      message: error.message 
    });
  }
};

/* ============================
   SEARCH DIC ITEMS
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
      return res.json([]);
    }

    let results = bhavam.dic;

    // Filter by search query if provided
    if (q) {
      const searchTerm = q.toLowerCase();
      results = results.filter(item => 
        item.text && item.text.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by category if provided
    if (cat) {
      const catNum = Number(cat);
      if (!isNaN(catNum)) {
        results = results.filter(item => 
          Array.isArray(item.cat) && item.cat.includes(catNum)
        );
      }
    }

    // Map results to include index
    const mappedResults = results.map((item, originalIndex) => {
      // Find original index in the dic array
      const originalIdx = bhavam.dic.indexOf(item);
      return {
        ...item,
        index: originalIdx
      };
    });

    res.json({
      success: true,
      count: mappedResults.length,
      data: mappedResults
    });
  } catch (error) {
    console.error("searchDicItems error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};