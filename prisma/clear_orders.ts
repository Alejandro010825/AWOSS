import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Eliminando órdenes existentes...')
  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({})
  console.log('Órdenes eliminadas con éxito.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
