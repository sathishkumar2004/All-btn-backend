const { Natchathiram } = require("../models");

/* ============================
   BULK CREATE NATCHATHIRAM
============================ */
exports.bulkCreateNatchathiram = async (req, res) => {
  try {
    const natchathirams = req.body;

    if (!Array.isArray(natchathirams) || natchathirams.length === 0) {
      return res.status(400).json({ error: "Invalid Natchathiram data" });
    }

    const normalized = natchathirams.map(n => ({
      ...n,
      dic: Array.isArray(n.dic)
        ? n.dic.map(d => ({
            text: d.text,
            cat: Array.isArray(d.cat) ? d.cat : [d.cat],
            category: Array.isArray(d.cat) ? d.cat : [d.cat] // Backward compatibility
          }))
        : []
    }));

    const inserted = await Natchathiram.bulkCreate(normalized, { validate: true });

    res.status(201).json({
      message: "Natchathiram bulk insert success",
      data: inserted
    });
  } catch (error) {
    console.error("bulkCreateNatchathiram error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

/* ============================
   GET ALL NATCHATHIRAM
============================ */
exports.getAllNatchathiram = async (req, res) => {
  try {
    const data = await Natchathiram.findAll();
    res.status(200).json(data);
  } catch (error) {
    console.error("getAllNatchathiram error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

/* ============================
   GET NATCHATHIRAM BY ID
============================ */
exports.getOneNatchathiram = async (req, res) => {
  try {
    const { id } = req.params;
    const natchathiram = await Natchathiram.findByPk(id);

    if (!natchathiram) {
      return res.status(404).json({ error: "Natchathiram not found" });
    }

    // Ensure dic is an array
    if (!Array.isArray(natchathiram.dic)) {
      natchathiram.dic = [];
    }

    res.status(200).json(natchathiram);
  } catch (error) {
    console.error("getOneNatchathiram error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

/* ============================
   UPDATE FULL dic[]
============================ */
exports.updateNatchathiramDic = async (req, res) => {
  try {
    const { id } = req.params;
    const { dic } = req.body;

    if (!Array.isArray(dic)) {
      return res.status(400).json({ error: "dic must be an array" });
    }

    const natchathiram = await Natchathiram.findByPk(id);
    if (!natchathiram) {
      return res.status(404).json({ error: "Natchathiram not found" });
    }

    // Use setDataValue to force Sequelize to detect change
    natchathiram.setDataValue('dic', dic);
    await natchathiram.save({ fields: ['dic'] });

    res.json({
      success: true,
      message: "Natchathiram dic updated successfully",
      data: natchathiram
    });
  } catch (error) {
    console.error("updateNatchathiramDic error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

/* ============================
   ADD DIC ITEM
============================ */
exports.addDicItem = async (req, res) => {
  try {
    console.log("➕ ADD DIC ITEM REQUEST (Natchathiram):", req.params, req.body);
    
    const { id } = req.params;
    const { text, cat } = req.body;

    // Validate input
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({
        error: "text is required and must be a non-empty string"
      });
    }

    if (!cat) {
      return res.status(400).json({
        error: "cat is required"
      });
    }

    // Convert cat to array and validate
    const catArray = Array.isArray(cat) ? cat : [cat];
    
    // Convert to numbers and filter out NaN values
    const catNumbers = catArray.map(c => Number(c)).filter(c => !isNaN(c));
    
    if (catNumbers.length === 0) {
      return res.status(400).json({
        error: "cat must contain valid numbers"
      });
    }

    const natchathiram = await Natchathiram.findByPk(id);
    if (!natchathiram) {
      return res.status(404).json({ error: "Natchathiram not found" });
    }

    // Initialize dic if not exists
    if (!Array.isArray(natchathiram.dic)) {
      natchathiram.dic = [];
    }

    // Create new item with both cat and category for compatibility
    const newItem = {
      text: text.trim(),
      cat: catNumbers,
      category: catNumbers, // Backward compatibility
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log("📝 Adding new item:", newItem);

    // Create updated dic array
    const updatedDic = [...natchathiram.dic, newItem];
    
    // Use setDataValue to force Sequelize to detect change
    natchathiram.setDataValue('dic', updatedDic);
    await natchathiram.save({ fields: ['dic'] });
    
    // Reload to get fresh data
    await natchathiram.reload();

    console.log("✅ Item added successfully. New dic length:", natchathiram.dic.length);

    res.status(201).json({
      success: true,
      message: "Dic item added successfully",
      data: {
        id: natchathiram.id,
        newItem: newItem,
        dic: natchathiram.dic,
        totalItems: natchathiram.dic.length
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

    const natchathiram = await Natchathiram.findByPk(id);
    if (!natchathiram) {
      return res.status(404).json({ error: "Natchathiram not found" });
    }

    if (!Array.isArray(natchathiram.dic) || indexNum >= natchathiram.dic.length) {
      return res.status(404).json({ error: "Dic item not found" });
    }

    res.status(200).json(natchathiram.dic[indexNum]);
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
    console.log("🔧 UPDATE REQUEST RECEIVED (Natchathiram):", {
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

    const natchathiram = await Natchathiram.findByPk(id);
    if (!natchathiram) {
      return res.status(404).json({ error: `Natchathiram with id ${id} not found` });
    }
    
    // Initialize dic if not exists
    if (!Array.isArray(natchathiram.dic)) {
      natchathiram.dic = [];
    }
    
    if (indexNum >= natchathiram.dic.length) {
      return res.status(400).json({ 
        error: "Invalid index",
        maxIndex: natchathiram.dic.length - 1,
        receivedIndex: indexNum,
        currentLength: natchathiram.dic.length
      });
    }

    // Create a DEEP copy
    const updatedDic = JSON.parse(JSON.stringify(natchathiram.dic));
    
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
      // Convert cat to array
      const catArray = Array.isArray(cat) ? cat : [cat];
      
      // Convert to numbers and filter out NaN
      const catNumbers = catArray.map(c => Number(c)).filter(c => !isNaN(c));
      
      if (catNumbers.length === 0) {
        return res.status(400).json({ 
          error: "cat must contain valid numbers" 
        });
      }
      
      // Sort arrays for comparison
      const currentCat = Array.isArray(updatedDic[indexNum].cat) 
        ? [...updatedDic[indexNum].cat].sort() 
        : [];
      const newCat = [...catNumbers].sort();
      
      const catChanged = JSON.stringify(currentCat) !== JSON.stringify(newCat);
      
      if (catChanged) {
        // Update both cat and category for compatibility
        updatedDic[indexNum].cat = catNumbers;
        updatedDic[indexNum].category = catNumbers;
        hasChanges = true;
        console.log("📝 Cat updated to:", catNumbers);
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
        data: natchathiram
      });
    }

    // Update timestamp
    updatedDic[indexNum].updatedAt = new Date().toISOString();
    
    // Use setDataValue to force Sequelize to detect change
    natchathiram.setDataValue('dic', updatedDic);
    
    console.log("💾 Saving to database...");
    
    // Save with explicit field
    await natchathiram.save({ fields: ['dic'] });
    
    // Reload to get fresh data
    await natchathiram.reload();
    
    console.log("✅ Update successful. New item:", updatedDic[indexNum]);

    res.json({
      success: true,
      message: "Dic item updated successfully",
      data: {
        id: natchathiram.id,
        updatedItem: natchathiram.dic[indexNum],
        dic: natchathiram.dic
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
    console.log("🗑️ DELETE DIC ITEM REQUEST (Natchathiram):", req.params);
    
    const { id, index } = req.params;
    const indexNum = Number(index);

    if (Number.isNaN(indexNum) || indexNum < 0) {
      return res.status(400).json({ 
        error: "index must be a valid positive number",
        receivedIndex: index
      });
    }

    const natchathiram = await Natchathiram.findByPk(id);
    if (!natchathiram) {
      return res.status(404).json({ error: `Natchathiram with id ${id} not found` });
    }

    // Initialize dic if not exists
    if (!Array.isArray(natchathiram.dic)) {
      natchathiram.dic = [];
    }

    console.log("📊 Current dic array length:", natchathiram.dic.length);

    if (indexNum >= natchathiram.dic.length) {
      return res.status(400).json({ 
        error: "Invalid index",
        maxIndex: natchathiram.dic.length - 1,
        receivedIndex: indexNum,
        currentLength: natchathiram.dic.length
      });
    }

    console.log("🗑️ Deleting item at index", indexNum, ":", natchathiram.dic[indexNum]);

    // Create a copy and remove the item
    const updatedDic = [...natchathiram.dic];
    updatedDic.splice(indexNum, 1);

    // Use setDataValue to force Sequelize to detect change
    natchathiram.setDataValue('dic', updatedDic);
    await natchathiram.save({ fields: ['dic'] });
    
    // Reload to get fresh data
    await natchathiram.reload();

    console.log("✅ Delete successful. New length:", natchathiram.dic.length);

    res.json({
      success: true,
      message: "Dic item deleted successfully",
      data: {
        id: natchathiram.id,
        dic: natchathiram.dic,
        totalItems: natchathiram.dic.length
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

    const natchathiram = await Natchathiram.findByPk(id);
    if (!natchathiram) {
      return res.status(404).json({ error: "Natchathiram not found" });
    }

    if (!Array.isArray(natchathiram.dic) || natchathiram.dic.length === 0) {
      return res.json([]);
    }

    let results = natchathiram.dic;

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
      const originalIdx = natchathiram.dic.indexOf(item);
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