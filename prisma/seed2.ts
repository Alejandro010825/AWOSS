import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding additional products and orders...')

  // 1. Obtener la primera categoría y el primer usuario (para usar de base)
  const category = await prisma.category.findFirst()
  let user = await prisma.user.findFirst({ where: { role: 'CLIENT' } })
  
  if (!user) {
      user = await prisma.user.findFirst()
  }

  if (!category || !user) {
    console.error('No hay categorías o usuarios en la BD. Ejecuta npx prisma db seed primero.')
    return
  }

  // 2. Crear 15 productos nuevos
  const newProducts = []
  for (let i = 1; i <= 15; i++) {
    const p = await prisma.product.create({
      data: {
        name: `Producto Generado Aleatorio #${i}`,
        price: Math.floor(Math.random() * 2000) + 100,
        inStock: Math.random() > 0.2, // 80% chance of being in stock
        categoryId: category.id
      }
    })
    newProducts.push(p)
  }

  // 3. Crear 5 órdenes nuevas para el usuario
  for (let i = 1; i <= 5; i++) {
    const p1 = newProducts[Math.floor(Math.random() * newProducts.length)]
    const p2 = newProducts[Math.floor(Math.random() * newProducts.length)]
    
    await prisma.order.create({
      data: {
        customerId: user.id,
        status: i % 2 === 0 ? 'ENTREGADO' : 'PENDIENTE',
        total: p1.price + (p2.price * 2),
        items: {
          create: [
            { productId: p1.id, quantity: 1, unitPrice: p1.price },
            { productId: p2.id, quantity: 2, unitPrice: p2.price }
          ]
        }
      }
    })
  }

  console.log('Seeding adicional completado con éxito.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
