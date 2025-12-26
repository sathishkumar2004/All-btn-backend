const { PlanetCombination } = require("../models");

//  Bulk insert
exports.bulkCreateCombination = async (req, res) => {
  try {
    const data = req.body;
    if (!Array.isArray(data) || data.length === 0) return res.status(400).json({ error: "Invalid combination data" });
    const inserted = await PlanetCombination.bulkCreate(data, { validate: true });
    res.status(201).json({ message: "Combination bulk insert success", data: inserted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

//  Get all
exports.getAllCombination = async (req, res) => {
  try {
    const data = await PlanetCombination.findAll();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

//  Get one
exports.getOneCombination = async (req, res) => {
  try {
    const combo = await PlanetCombination.findByPk(req.params.id);
    if (!combo) return res.status(404).json({ error: "Combination not found" });
    res.json(combo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

//  Update dic[]
exports.updateCombinationDic = async (req, res) => {
  try {
    const combo = await PlanetCombination.findByPk(req.params.id);
    if (!combo) return res.status(404).json({ error: "Combination not found" });

    combo.dic = req.body.dic;
    await combo.save();
    res.json({ message: "Combination dic updated", data: combo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

//  Add dic item
exports.addDicItem = async (req, res) => {
  try {
    const combo = await PlanetCombination.findByPk(req.params.id);
    if (!combo) return res.status(404).json({ error: "Combination not found" });

    const newItem = req.body;
    if (!newItem || !newItem.text || !newItem.category) return res.status(400).json({ error: "Invalid dic item" });

    combo.dic.push(newItem);
    await combo.save();
    res.json({ message: "Dic item added", data: combo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

//  Update dic item by index
exports.updateDicItem = async (req, res) => {
  try {
    const combo = await PlanetCombination.findByPk(req.params.id);
    if (!combo) return res.status(404).json({ error: "Combination not found" });

    const { index, text, category } = req.body;
    if (index === undefined || !combo.dic[index]) return res.status(400).json({ error: "Invalid index" });

    if (text) combo.dic[index].text = text;
    if (category) combo.dic[index].category = category;

    await combo.save();
    res.json({ message: "Dic item updated", data: combo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

//  Delete dic item by index
exports.deleteDicItem = async (req, res) => {
  try {
    const combo = await PlanetCombination.findByPk(req.params.id);
    if (!combo) return res.status(404).json({ error: "Combination not found" });

    const { index } = req.body;
    if (index === undefined || !combo.dic[index]) return res.status(400).json({ error: "Invalid index" });

    combo.dic.splice(index, 1);
    await combo.save();
    res.json({ message: "Dic item deleted", data: combo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};
