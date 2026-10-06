import { PrismaClient, AgentStatus, VehicleType } from '@prisma/client';

const prisma = new PrismaClient();

const sampleAgents = [
  {
    name: 'Carlos Rodriguez',
    phone: '+1-202-555-0143',
    email: 'carlos.rodriguez@speedyfleet.com',
    serviceArea: 'Downtown Central',
    status: AgentStatus.ACTIVE,
    vehicleType: VehicleType.MOTORCYCLE,
    rating: 4.9,
    currentLoad: 2,
    maxCapacity: 10,
    notes: 'Primary express courier for financial district. Fast delivery track record.',
  },
  {
    name: 'Sarah Chen',
    phone: '+1-202-555-0187',
    email: 'sarah.chen@speedyfleet.com',
    serviceArea: 'Uptown North',
    status: AgentStatus.ON_DUTY,
    vehicleType: VehicleType.CAR,
    rating: 4.8,
    currentLoad: 4,
    maxCapacity: 15,
    notes: 'Handles bulk parcel drops in high-density residential towers.',
  },
  {
    name: 'Marcus Johnson',
    phone: '+1-202-555-0199',
    email: 'marcus.j@speedyfleet.com',
    serviceArea: 'Metro West',
    status: AgentStatus.ACTIVE,
    vehicleType: VehicleType.VAN,
    rating: 4.7,
    currentLoad: 1,
    maxCapacity: 25,
    notes: 'Equipped with refrigerated cargo box for perishable items.',
  },
  {
    name: 'Elena Rostova',
    phone: '+1-202-555-0122',
    email: 'elena.rostova@speedyfleet.com',
    serviceArea: 'Downtown Central',
    status: AgentStatus.OFF_DUTY,
    vehicleType: VehicleType.BICYCLE,
    rating: 4.95,
    currentLoad: 0,
    maxCapacity: 6,
    notes: 'Eco-courier specialist. Zero emission urban deliveries.',
  },
  {
    name: 'Devon Patel',
    phone: '+1-202-555-0158',
    email: 'devon.patel@speedyfleet.com',
    serviceArea: 'East Harbor District',
    status: AgentStatus.ACTIVE,
    vehicleType: VehicleType.MOTORCYCLE,
    rating: 4.6,
    currentLoad: 3,
    maxCapacity: 12,
    notes: 'Covers port area and industrial parks.',
  },
  {
    name: 'Amara Okafor',
    phone: '+1-202-555-0174',
    email: 'amara.okafor@speedyfleet.com',
    serviceArea: 'Metro West',
    status: AgentStatus.INACTIVE,
    vehicleType: VehicleType.CAR,
    rating: 4.85,
    currentLoad: 0,
    maxCapacity: 15,
    notes: 'On temporary leave until next week.',
  },
  {
    name: 'Lucas Silva',
    phone: '+1-202-555-0163',
    email: 'lucas.silva@speedyfleet.com',
    serviceArea: 'Uptown North',
    status: AgentStatus.ON_DUTY,
    vehicleType: VehicleType.MOTORCYCLE,
    rating: 4.9,
    currentLoad: 5,
    maxCapacity: 10,
    notes: 'Night shift delivery specialist.',
  },
  {
    name: 'Aisha Al-Mansoor',
    phone: '+1-202-555-0115',
    email: 'aisha.m@speedyfleet.com',
    serviceArea: 'East Harbor District',
    status: AgentStatus.SUSPENDED,
    vehicleType: VehicleType.CAR,
    rating: 3.8,
    currentLoad: 0,
    maxCapacity: 12,
    notes: 'Account under internal quality audit.',
  },
];

async function main() {
  console.log('Seeding delivery agents...');

  for (const agent of sampleAgents) {
    await prisma.deliveryAgent.upsert({
      where: { email: agent.email },
      update: agent,
      create: agent,
    });
  }

  const count = await prisma.deliveryAgent.count();
  console.log(`Seeding complete. Total agents in database: ${count}`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
