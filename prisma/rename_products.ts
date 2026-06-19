import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Renaming generic products...')

  const genericProducts = await prisma.product.findMany({
    where: {
      name: {
        startsWith: 'Producto Generado Aleatorio'
      }
    }
  })

  const realNames = [
    "Monitor curvo 144hz 24 pulgadas",
    "Mouse inalámbrico ergonómico Pro",
    "Webcam Full HD 1080p con micrófono",
    "Cable HDMI 2.0 trenzado 2 metros",
    "Memoria RAM DDR4 16GB 3200MHz RGB",
    "Disco Duro Sólido SSD 1TB M.2 NVMe",
    "Funda para Laptop 15.6 pulgadas impermeable",
    "Base enfriadora para laptop con 5 ventiladores",
    "Micrófono de condensador USB para streaming",
    "Aro de luz LED de 10 pulgadas con trípode",
    "Hub USB-C 7 en 1 multipuerto aluminio",
    "Teclado Inalámbrico Bluetooth multidispositivo",
    "Bocina Inteligente portátil con graves",
    "Cargador de pared Rápido GaN 65W",
    "Audífonos Bluetooth con cancelación de ruido"
  ]

  for (let i = 0; i < genericProducts.length; i++) {
    const newName = realNames[i % realNames.length]
    await prisma.product.update({
      where: { id: genericProducts[i].id },
      data: { name: newName }
    })
  }

  console.log('Productos actualizados con éxito a nombres realistas.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
