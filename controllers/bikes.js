const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const axios = require('axios');

// @desc        Get Stations
// @route       GET /api/v1/jcbikes/stations
// @access      Public
exports.getStations = asyncHandler(async (req, res, next) => {
    // const searchResults = await model.find({ $text: { $search: req.query.q } });
    const { contract } = req.params;
    let contractsUrl = `https://api.jcdecaux.com/vls/v1/stations?apiKey=${process.env.JCD_API_KEY}`;
    if (contract) {
        contractsUrl = `https://api.jcdecaux.com/vls/v1/stations?contract=${contract}&apiKey=${process.env.JCD_API_KEY}`;
    }

    const stations = await axios.get(contractsUrl);

    if (!stations) {
        return next(
            new ErrorResponse(`Error getting bike stations data from API`, 404)
        );
    }

    res.status(200).json({ success: true, data: stations.data });
});

// @desc        Get Station
// @route       GET /api/v1/jcbikes/stations/:contract/:number
// @access      Public
exports.getStation = asyncHandler(async (req, res, next) => {
    const stations = await axios.get(
        `https://api.jcdecaux.com/vls/v1/stations/${req.params.number}?contract=${req.params.contract}&apiKey=${process.env.JCD_API_KEY}`
    );

    if (!stations) {
        return next(
            new ErrorResponse(`Error getting bike stations data from API`, 404)
        );
    }

    res.status(200).json({ success: true, data: stations.data });
});

// @desc        Get Contract List
// @route       GET /api/v1/jcbikes/contracts
// @access      Public
exports.getContracts = asyncHandler(async (req, res, next) => {
    const contracts = await axios.get(
        `https://api.jcdecaux.com/vls/v1/contracts?apiKey=${process.env.JCD_API_KEY}`
    );

    if (!contracts) {
        return next(
            new ErrorResponse(
                `Error getting contracts data from JCDeceaux API`,
                404
            )
        );
    }

    res.status(200).json({ success: true, data: contracts.data });
});

// @desc        Get Park List of Contract
// @route       GET /api/v1/jcbikes/parking/:contract
// @access      Public
exports.getParkList = asyncHandler(async (req, res, next) => {
    const parkingList = await axios.get(
        `https://api.jcdecaux.com/parking/v1/contracts/${req.params.contract}/parks?apiKey=${process.env.JCD_API_KEY}`
    );

    if (!parkingList) {
        return next(
            new ErrorResponse(
                `Error getting contracts data from JCDeceaux API`,
                404
            )
        );
    }

    res.status(200).json({ success: true, data: parkingList.data });
});
