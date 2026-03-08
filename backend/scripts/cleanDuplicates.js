import prisma from '../src/config/prisma.js';

async function cleanDuplicates() {
  console.log('Cleaning duplicate maintenance records...');
  
  const vehicles = await prisma.vehicle.findMany({ select: { id: true } });
  
  for (const vehicle of vehicles) {
    const types = ['INSURANCE', 'OIL_CHANGE', 'SERVICE'];
    
    for (const type of types) {
      const records = await prisma.maintenance.findMany({
        where: { 
          vehicleId: vehicle.id, 
          type: type,
          isCompleted: false,
          isDeleted: false
        },
        orderBy: { id: 'desc' }
      });
      
      if (records.length > 1) {
        const toKeep = records[0];
        const toDelete = records.slice(1);
        
        console.log(`Vehicle ${vehicle.id}, ${type}: Keeping ID ${toKeep.id}, deleting ${toDelete.length} duplicates`);
        
        await prisma.maintenance.updateMany({
          where: { id: { in: toDelete.map(r => r.id) } },
          data: { isDeleted: true, deletedAt: new Date() }
        });
      }
    }
  }
  
  console.log('Cleanup complete!');
  await prisma.$disconnect();
}

cleanDuplicates().catch(console.error);
