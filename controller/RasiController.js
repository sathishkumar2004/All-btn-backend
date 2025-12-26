const { Rasi } = require("../models");

/* ============================
   BULK CREATE RASI
============================ */
exports.bulkCreateRasi = async (req, res) => {
  try {
    const rasis = req.body;

    if (!Array.isArray(rasis) || rasis.length === 0) {
      return res.status(400).json({ error: "Invalid Rasi data" });
    }

    const normalized = rasis.map(r => ({
      ...r,
      dic: Array.isArray(r.dic)
        ? r.dic.map(d => ({
            text: d.text,
            cat: Array.isArray(d.cat) ? d.cat : [d.cat]
          }))
        : []
    }));

    const inserted = await Rasi.bulkCreate(normalized, { validate: true });

    res.status(201).json({
      message: "Rasi bulk insert success",
      data: inserted
    });
  } catch (error) {
    console.error("bulkCreateRasi error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

/* ============================
   GET ALL RASI
============================ */
exports.getAllRasi = async (req, res) => {
  try {
    const data = await Rasi.findAll();
    res.status(200).json(data);
  } catch (error) {
    console.error("getAllRasi error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

/* ============================
   GET RASI BY ID
============================ */
exports.getRasiById = async (req, res) => {
  try {
    const { id } = req.params;
    const rasi = await Rasi.findByPk(id);

    if (!rasi) {
      return res.status(404).json({ error: "Rasi not found" });
    }

    // Ensure dic is an array
    if (!Array.isArray(rasi.dic)) {
      rasi.dic = [];
    }

    res.status(200).json(rasi);
  } catch (error) {
    console.error("getRasiById error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

/* ============================
   UPDATE FULL dic[]
============================ */
exports.updateRasiDic = async (req, res) => {
  try {
    const { id } = req.params;
    const { dic } = req.body;

    if (!Array.isArray(dic)) {
      return res.status(400).json({ error: "dic must be an array" });
    }

    const rasi = await Rasi.findByPk(id);
    if (!rasi) {
      return res.status(404).json({ error: "Rasi not found" });
    }

    // Use setDataValue to force Sequelize to detect change
    rasi.setDataValue('dic', dic);
    await rasi.save({ fields: ['dic'] });

    res.json({
      success: true,
      message: "Rasi dic updated successfully",
      data: rasi
    });
  } catch (error) {
    console.error("updateRasiDic error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

/* ============================
   ADD DIC ITEM - UPDATED
============================ */
exports.addDicItem = async (req, res) => {
  try {
    console.log("➕ ADD DIC ITEM REQUEST (Rasi):", req.params, req.body);
    
    const { id } = req.params;
    const { text, cat } = req.body;

    if (!text || !Array.isArray(cat) || cat.length === 0) {
      return res.status(400).json({
        error: "text and cat (non-empty array) are required"
      });
    }

    const rasi = await Rasi.findByPk(id);
    if (!rasi) {
      return res.status(404).json({ error: "Rasi not found" });
    }

    // Initialize dic if not exists
    if (!Array.isArray(rasi.dic)) {
      rasi.dic = [];
    }

    // Create new item
    const newItem = {
      text: text.trim(),
      cat: cat,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log("📝 Adding new item:", newItem);

    // Create updated dic array
    const updatedDic = [...rasi.dic, newItem];
    
    // Use setDataValue to force Sequelize to detect change
    rasi.setDataValue('dic', updatedDic);
    await rasi.save({ fields: ['dic'] });
    
    // Reload to get fresh data
    await rasi.reload();

    console.log("✅ Item added successfully. New dic length:", rasi.dic.length);

    res.status(201).json({
      success: true,
      message: "Dic item added successfully",
      data: {
        id: rasi.id,
        newItem: newItem,
        dic: rasi.dic,
        totalItems: rasi.dic.length
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

    const rasi = await Rasi.findByPk(id);
    if (!rasi) {
      return res.status(404).json({ error: "Rasi not found" });
    }

    if (!Array.isArray(rasi.dic) || indexNum >= rasi.dic.length) {
      return res.status(404).json({ error: "Dic item not found" });
    }

    res.status(200).json(rasi.dic[indexNum]);
  } catch (error) {
    console.error("getSingleDic error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

/* ============================
   UPDATE DIC ITEM - IMPROVED
============================ */
exports.updateDicItem = async (req, res) => {
  try {
    console.log("🔧 UPDATE REQUEST RECEIVED:", {
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

    const rasi = await Rasi.findByPk(id);
    if (!rasi) {
      return res.status(404).json({ error: `Rasi with id ${id} not found` });
    }
    
    // Initialize dic if not exists
    if (!Array.isArray(rasi.dic)) {
      rasi.dic = [];
    }
    
    if (indexNum >= rasi.dic.length) {
      return res.status(400).json({ 
        error: "Invalid index",
        maxIndex: rasi.dic.length - 1,
        receivedIndex: indexNum,
        currentLength: rasi.dic.length
      });
    }

    // Create a DEEP copy
    const updatedDic = JSON.parse(JSON.stringify(rasi.dic));
    
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
        data: rasi
      });
    }

    // Update timestamp
    updatedDic[indexNum].updatedAt = new Date().toISOString();
    
    // Use setDataValue to force Sequelize to detect change
    rasi.setDataValue('dic', updatedDic);
    
    console.log("💾 Saving to database...");
    
    // Save with explicit field
    await rasi.save({ fields: ['dic'] });
    
    // Reload to get fresh data
    await rasi.reload();
    
    console.log("✅ Update successful. New item:", updatedDic[indexNum]);

    res.json({
      success: true,
      message: "Dic item updated successfully",
      data: {
        id: rasi.id,
        updatedItem: rasi.dic[indexNum],
        dic: rasi.dic
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
   DELETE DIC ITEM - UPDATED
============================ */
exports.deleteDicItem = async (req, res) => {
  try {
    console.log("🗑️ DELETE DIC ITEM REQUEST:", req.params);
    
    const { id, index } = req.params;
    const indexNum = Number(index);

    if (Number.isNaN(indexNum) || indexNum < 0) {
      return res.status(400).json({ 
        error: "index must be a valid positive number",
        receivedIndex: index
      });
    }

    const rasi = await Rasi.findByPk(id);
    if (!rasi) {
      return res.status(404).json({ error: `Rasi with id ${id} not found` });
    }

    // Initialize dic if not exists
    if (!Array.isArray(rasi.dic)) {
      rasi.dic = [];
    }

    console.log("📊 Current dic array length:", rasi.dic.length);

    if (indexNum >= rasi.dic.length) {
      return res.status(400).json({ 
        error: "Invalid index",
        maxIndex: rasi.dic.length - 1,
        receivedIndex: indexNum,
        currentLength: rasi.dic.length
      });
    }

    console.log("🗑️ Deleting item at index", indexNum, ":", rasi.dic[indexNum]);

    // Create a copy and remove the item
    const updatedDic = [...rasi.dic];
    updatedDic.splice(indexNum, 1);

    // Use setDataValue to force Sequelize to detect change
    rasi.setDataValue('dic', updatedDic);
    await rasi.save({ fields: ['dic'] });
    
    // Reload to get fresh data
    await rasi.reload();

    console.log("✅ Delete successful. New length:", rasi.dic.length);

    res.json({
      success: true,
      message: "Dic item deleted successfully",
      data: {
        id: rasi.id,
        dic: rasi.dic,
        totalItems: rasi.dic.length
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