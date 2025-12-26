// controllers/FilterController.js
const RasiTable = require("../models/rasiTable");
const Natchathiram = require("../models/Natchathiram");
const Bhavam = require("../models/Bhavam");
const PlanetCombination = require("../models/PlanetCombination");

// ======================= MAIN FILTER FUNCTION =======================
// ஒரே function இல் அனைத்து டேபிள்களையும் filter செய்யும்
exports.filterAllData = async (req, res) => {
  try {
    const { 
      rasi_id, 
      house_id, 
      bhavam_id, 
      natchathiram_id, 
      planets,
      filter = 'all' 
    } = req.query;

    const results = {};

    // 1. RASI FILTER
    if (rasi_id) {
      const rasi = await RasiTable.findOne({ where: { rasi_id } });
      if (rasi) {
        results.rasi = {
          data: rasi,
          filtered_dic: filter === 'all' ? rasi.dic : rasi.dic.filter(item => item.cat === filter),
          filter_applied: filter
        };
      }
    }

    // 2. HOUSE FILTER
    if (house_id) {
      const house = await House.findOne({ where: { house_id } });
      if (house) {
        results.house = {
          data: house,
          filtered_dic: filter === 'all' ? house.dic : house.dic.filter(item => item.cat === filter),
          filter_applied: filter
        };
      }
    }

    // 3. BHAVAM FILTER
    if (bhavam_id) {
      const bhavam = await Bhavam.findOne({ where: { bhavam_id } });
      if (bhavam) {
        results.bhavam = {
          data: bhavam,
          filtered_dic: filter === 'all' ? bhavam.dic : bhavam.dic.filter(item => item.cat === filter),
          filter_applied: filter
        };
      }
    }

    // 4. NATCHATHIRAM FILTER
    if (natchathiram_id) {
      const natchathiram = await Natchathiram.findOne({ where: { natchathiram_id } });
      if (natchathiram) {
        results.natchathiram = {
          data: natchathiram,
          filtered_dic: filter === 'all' ? natchathiram.dic : natchathiram.dic.filter(item => item.cat === filter),
          filter_applied: filter
        };
      }
    }

    // 5. PLANET COMBINATION FILTER
    if (planets) {
      const planetsArray = decodeURIComponent(planets).split('+');
      const planetsString = planetsArray.sort().join('_');
      
      const combination = await PlanetCombination.findOne({
        where: { planets_string: planetsString },
      });

      if (combination) {
        results.combination = {
          data: combination,
          filtered_dic: filter === 'all' ? combination.dic : combination.dic.filter(item => item.cat === filter),
          filter_applied: filter
        };
      }
    }

    res.json({
      success: true,
      filter_applied: filter,
      timestamp: new Date().toISOString(),
      results: results
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ======================= BULK FILTER =======================
// பல IDs ஒரே நேரத்தில் filter செய்ய
exports.bulkFilter = async (req, res) => {
  try {
    const { 
      rasi_ids = [],
      house_ids = [],
      bhavam_ids = [],
      natchathiram_ids = [],
      planets_list = [],
      filter = 'all' 
    } = req.body;

    const results = {};

    // 1. Multiple Rasis filter
    if (rasi_ids.length > 0) {
      const rasis = await RasiTable.findAll({
        where: { rasi_id: rasi_ids }
      });
      
      results.rasi = rasis.map(rasi => ({
        id: rasi.rasi_id,
        name: rasi.name,
        filtered_dic: filter === 'all' ? rasi.dic : rasi.dic.filter(item => item.cat === filter),
        total_points: rasi.dic.length,
        filtered_points: filter === 'all' ? rasi.dic.length : rasi.dic.filter(item => item.cat === filter).length
      }));
    }

    // 2. Multiple Houses filter
    if (house_ids.length > 0) {
      const houses = await House.findAll({
        where: { house_id: house_ids }
      });
      
      results.house = houses.map(house => ({
        id: house.house_id,
        name: house.name,
        filtered_dic: filter === 'all' ? house.dic : house.dic.filter(item => item.cat === filter),
        total_points: house.dic.length,
        filtered_points: filter === 'all' ? house.dic.length : house.dic.filter(item => item.cat === filter).length
      }));
    }

    // 3. Multiple Bhavams filter
    if (bhavam_ids.length > 0) {
      const bhavams = await Bhavam.findAll({
        where: { bhavam_id: bhavam_ids }
      });
      
      results.bhavam = bhavams.map(bhavam => ({
        id: bhavam.bhavam_id,
        name: bhavam.name,
        filtered_dic: filter === 'all' ? bhavam.dic : bhavam.dic.filter(item => item.cat === filter),
        total_points: bhavam.dic.length,
        filtered_points: filter === 'all' ? bhavam.dic.length : bhavam.dic.filter(item => item.cat === filter).length
      }));
    }

    // 4. Multiple Natchathirams filter
    if (natchathiram_ids.length > 0) {
      const natchathirams = await Natchathiram.findAll({
        where: { natchathiram_id: natchathiram_ids }
      });
      
      results.natchathiram = natchathirams.map(natchathiram => ({
        id: natchathiram.natchathiram_id,
        name: natchathiram.name,
        filtered_dic: filter === 'all' ? natchathiram.dic : natchathiram.dic.filter(item => item.cat === filter),
        total_points: natchathiram.dic.length,
        filtered_points: filter === 'all' ? natchathiram.dic.length : natchathiram.dic.filter(item => item.cat === filter).length
      }));
    }

    // 5. Multiple Planet Combinations filter
    if (planets_list.length > 0) {
      const combinations = await Promise.all(
        planets_list.map(async planets => {
          const planetsArray = Array.isArray(planets) ? planets : [planets];
          const planetsString = planetsArray.sort().join('_');
          
          const combination = await PlanetCombination.findOne({
            where: { planets_string: planetsString },
          });
          
          if (combination) {
            return {
              planets: combination.planets,
              filtered_dic: filter === 'all' ? combination.dic : combination.dic.filter(item => item.cat === filter),
              total_points: combination.dic.length,
              filtered_points: filter === 'all' ? combination.dic.length : combination.dic.filter(item => item.cat === filter).length
            };
          }
          return null;
        })
      );
      
      results.combinations = combinations.filter(item => item !== null);
    }

    res.json({
      success: true,
      filter_applied: filter,
      timestamp: new Date().toISOString(),
      results: results
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ======================= GET ALL FILTERED DATA =======================
exports.getAllFilteredData = async (req, res) => {
  try {
    const { filter = 'all' } = req.query;

    // Get all data from all tables
    const [allRasis, allHouses, allBhavams, allNatchathirams, allCombinations] = await Promise.all([
      RasiTable.findAll({ order: [['rasi_id', 'ASC']] }),
      House.findAll({ order: [['house_id', 'ASC']] }),
      Bhavam.findAll({ order: [['bhavam_id', 'ASC']] }),
      Natchathiram.findAll({ order: [['natchathiram_id', 'ASC']] }),
      PlanetCombination.findAll({ order: [['id', 'ASC']] })
    ]);

    // Apply filter to all data
    const filteredData = {
      rasis: allRasis.map(rasi => ({
        id: rasi.rasi_id,
        name: rasi.name,
        filtered_dic: filter === 'all' ? rasi.dic : rasi.dic.filter(item => item.cat === filter),
        total_points: rasi.dic.length,
        filtered_points: filter === 'all' ? rasi.dic.length : rasi.dic.filter(item => item.cat === filter).length
      })),
      
      houses: allHouses.map(house => ({
        id: house.house_id,
        name: house.name,
        filtered_dic: filter === 'all' ? house.dic : house.dic.filter(item => item.cat === filter),
        total_points: house.dic.length,
        filtered_points: filter === 'all' ? house.dic.length : house.dic.filter(item => item.cat === filter).length
      })),
      
      bhavams: allBhavams.map(bhavam => ({
        id: bhavam.bhavam_id,
        name: bhavam.name,
        filtered_dic: filter === 'all' ? bhavam.dic : bhavam.dic.filter(item => item.cat === filter),
        total_points: bhavam.dic.length,
        filtered_points: filter === 'all' ? bhavam.dic.length : bhavam.dic.filter(item => item.cat === filter).length
      })),
      
      natchathirams: allNatchathirams.map(natchathiram => ({
        id: natchathiram.natchathiram_id,
        name: natchathiram.name,
        filtered_dic: filter === 'all' ? natchathiram.dic : natchathiram.dic.filter(item => item.cat === filter),
        total_points: natchathiram.dic.length,
        filtered_points: filter === 'all' ? natchathiram.dic.length : natchathiram.dic.filter(item => item.cat === filter).length
      })),
      
      combinations: allCombinations.map(combination => ({
        id: combination.id,
        planets: combination.planets,
        filtered_dic: filter === 'all' ? combination.dic : combination.dic.filter(item => item.cat === filter),
        total_points: combination.dic.length,
        filtered_points: filter === 'all' ? combination.dic.length : combination.dic.filter(item => item.cat === filter).length
      }))
    };

    res.json({
      success: true,
      filter_applied: filter,
      timestamp: new Date().toISOString(),
      data: filteredData,
      summary: {
        total_rasis: filteredData.rasis.length,
        total_houses: filteredData.houses.length,
        total_bhavams: filteredData.bhavams.length,
        total_natchathirams: filteredData.natchathirams.length,
        total_combinations: filteredData.combinations.length
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};