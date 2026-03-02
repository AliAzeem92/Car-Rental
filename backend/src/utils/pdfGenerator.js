export const generateContractPDF = async (reservation, vehicle, customer) => {
  return `http://localhost:5000/api/reservations/${reservation.id}/contract.pdf`;
};
