module.exports = function(hotelData, hotelId) {
	if(!hotelData[hotelId]) {
		return; 
	}
	var hotelDetailsContext = JSON.parse(JSON.stringify(hotelData[hotelId]));

	if(hotelDetailsContext.providerName === 'Commission') {
		hotelDetailsContext.providerName = 'LateRooms'
	}

	return hotelDetailsContext;
};
