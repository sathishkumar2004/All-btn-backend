const { Planet } = require("../models");

/* ============================
   BULK CREATE PLANETS
============================ */
exports.bulkCreatePlanets = async (req, res) => {
  try {
    const planets = req.body;

    if (!Array.isArray(planets) || planets.length === 0) {
      return res.status(400).json({ error: "Invalid Planet data" });
    }

    const normalized = planets.map(p => ({
      ...p,
      dic: Array.isArray(p.dic)
        ? p.dic.map(d => ({
            text: d.text,
            cat: Array.isArray(d.cat) ? d.cat : [d.cat],
            category: Array.isArray(d.cat) ? d.cat : [d.cat] // Backward compatibility
          }))
        : []
    }));

    const inserted = await Planet.bulkCreate(normalized, { validate: true });

    res.status(201).json({
      message: "Planet bulk insert success",
      data: inserted
    });
  } catch (error) {
    console.error("bulkCreatePlanets error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

/* ============================
   GET ALL PLANETS
============================ */
exports.getAllPlanets = async (req, res) => {
  try {
    const data = await Planet.findAll();
    res.status(200).json(data);
  } catch (error) {
    console.error("getAllPlanets error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

/* ============================
   GET PLANET BY ID
============================ */
exports.getOnePlanet = async (req, res) => {
  try {
    const { id } = req.params;
    const planet = await Planet.findByPk(id);

    if (!planet) {
      return res.status(404).json({ error: "Planet not found" });
    }

    // Ensure dic is an array
    if (!Array.isArray(planet.dic)) {
      planet.dic = [];
    }

    res.status(200).json(planet);
  } catch (error) {
    console.error("getOnePlanet error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

/* ============================
   UPDATE FULL dic[]
============================ */
exports.updatePlanetDic = async (req, res) => {
  try {
    const { id } = req.params;
    const { dic } = req.body;

    if (!Array.isArray(dic)) {
      return res.status(400).json({ error: "dic must be an array" });
    }

    const planet = await Planet.findByPk(id);
    if (!planet) {
      return res.status(404).json({ error: "Planet not found" });
    }

    // Use setDataValue to force Sequelize to detect change
    planet.setDataValue('dic', dic);
    await planet.save({ fields: ['dic'] });

    res.json({
      success: true,
      message: "Planet dic updated successfully",
      data: planet
    });
  } catch (error) {
    console.error("updatePlanetDic error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

/* ============================
   ADD DIC ITEM
============================ */
exports.addDicItem = async (req, res) => {
  try {
    console.log("➕ ADD DIC ITEM REQUEST (Planet):", req.params, req.body);
    
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

    const planet = await Planet.findByPk(id);
    if (!planet) {
      return res.status(404).json({ error: "Planet not found" });
    }

    // Initialize dic if not exists
    if (!Array.isArray(planet.dic)) {
      planet.dic = [];
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
    const updatedDic = [...planet.dic, newItem];
    
    // Use setDataValue to force Sequelize to detect change
    planet.setDataValue('dic', updatedDic);
    await planet.save({ fields: ['dic'] });
    
    // Reload to get fresh data
    await planet.reload();

    console.log("✅ Item added successfully. New dic length:", planet.dic.length);

    res.status(201).json({
      success: true,
      message: "Dic item added successfully",
      data: {
        id: planet.id,
        newItem: newItem,
        dic: planet.dic,
        totalItems: planet.dic.length
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

    const planet = await Planet.findByPk(id);
    if (!planet) {
      return res.status(404).json({ error: "Planet not found" });
    }

    if (!Array.isArray(planet.dic) || indexNum >= planet.dic.length) {
      return res.status(404).json({ error: "Dic item not found" });
    }

    res.status(200).json(planet.dic[indexNum]);
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
    console.log("🔧 UPDATE REQUEST RECEIVED (Planet):", {
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

    const planet = await Planet.findByPk(id);
    if (!planet) {
      return res.status(404).json({ error: `Planet with id ${id} not found` });
    }
    
    // Initialize dic if not exists
    if (!Array.isArray(planet.dic)) {
      planet.dic = [];
    }
    
    if (indexNum >= planet.dic.length) {
      return res.status(400).json({ 
        error: "Invalid index",
        maxIndex: planet.dic.length - 1,
        receivedIndex: indexNum,
        currentLength: planet.dic.length
      });
    }

    // Create a DEEP copy
    const updatedDic = JSON.parse(JSON.stringify(planet.dic));
    
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
        data: planet
      });
    }

    // Update timestamp
    updatedDic[indexNum].updatedAt = new Date().toISOString();
    
    // Use setDataValue to force Sequelize to detect change
    planet.setDataValue('dic', updatedDic);
    
    console.log("💾 Saving to database...");
    
    // Save with explicit field
    await planet.save({ fields: ['dic'] });
    
    // Reload to get fresh data
    await planet.reload();
    
    console.log("✅ Update successful. New item:", updatedDic[indexNum]);

    res.json({
      success: true,
      message: "Dic item updated successfully",
      data: {
        id: planet.id,
        updatedItem: planet.dic[indexNum],
        dic: planet.dic
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
    console.log("🗑️ DELETE DIC ITEM REQUEST (Planet):", req.params);
    
    const { id, index } = req.params;
    const indexNum = Number(index);

    if (Number.isNaN(indexNum) || indexNum < 0) {
      return res.status(400).json({ 
        error: "index must be a valid positive number",
        receivedIndex: index
      });
    }

    const planet = await Planet.findByPk(id);
    if (!planet) {
      return res.status(404).json({ error: `Planet with id ${id} not found` });
    }

    // Initialize dic if not exists
    if (!Array.isArray(planet.dic)) {
      planet.dic = [];
    }

    console.log("📊 Current dic array length:", planet.dic.length);

    if (indexNum >= planet.dic.length) {
      return res.status(400).json({ 
        error: "Invalid index",
        maxIndex: planet.dic.length - 1,
        receivedIndex: indexNum,
        currentLength: planet.dic.length
      });
    }

    console.log("🗑️ Deleting item at index", indexNum, ":", planet.dic[indexNum]);

    // Create a copy and remove the item
    const updatedDic = [...planet.dic];
    updatedDic.splice(indexNum, 1);

    // Use setDataValue to force Sequelize to detect change
    planet.setDataValue('dic', updatedDic);
    await planet.save({ fields: ['dic'] });
    
    // Reload to get fresh data
    await planet.reload();

    console.log("✅ Delete successful. New length:", planet.dic.length);

    res.json({
      success: true,
      message: "Dic item deleted successfully",
      data: {
        id: planet.id,
        dic: planet.dic,
        totalItems: planet.dic.length
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

    const planet = await Planet.findByPk(id);
    if (!planet) {
      return res.status(404).json({ error: "Planet not found" });
    }

    if (!Array.isArray(planet.dic) || planet.dic.length === 0) {
      return res.json([]);
    }

    let results = planet.dic;

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
      const originalIdx = planet.dic.indexOf(item);
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