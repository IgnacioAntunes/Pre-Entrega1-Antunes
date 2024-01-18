const express = require('express');
const fs = require('fs/promises');

const app = express();
const PORT = 8080;

// Middleware para parsear el cuerpo de las solicitudes como JSON
app.use(express.json());

// Rutas para Productos
const productosRouter = express.Router();

productosRouter.get('/', async (req, res) => {
try {
    // Lógica para obtener la lista de productos desde "productos.json"
    const productos = await obtenerProductos();
    res.json(productos);
} catch (error) {
    res.status(500).json({ error: 'Error al obtener productos.' });
}
});

productosRouter.get('/:pid', async (req, res) => {
try {
    const { pid } = req.params;
    // Lógica para obtener un producto por ID desde "productos.json"
    const producto = await obtenerProductoPorId(pid);
    if (producto) {
    res.json(producto);
    } else {
    res.status(404).json({ error: 'Producto no encontrado.' });
    }
} catch (error) {
    res.status(500).json({ error: 'Error al obtener el producto.' });
}
});

productosRouter.post('/', async (req, res) => {
try {
    const nuevoProducto = req.body;
    // Lógica para agregar un nuevo producto a "productos.json"
    const productoAgregado = await agregarProducto(nuevoProducto);
    res.json(productoAgregado);
} catch (error) {
    res.status(400).json({ error: 'Error al agregar el producto.' });
}
});

// Rutas para Carritos
const carritosRouter = express.Router();

carritosRouter.get('/:cid', async (req, res) => {
try {
    const { cid } = req.params;
    // Lógica para obtener los productos de un carrito desde "carrito.json"
    const productosEnCarrito = await obtenerProductosEnCarrito(cid);
    res.json(productosEnCarrito);
} catch (error) {
    res.status(500).json({ error: 'Error al obtener productos del carrito.' });
}
});

carritosRouter.post('/:cid/product/:pid', async (req, res) => {
try {
    const { cid, pid } = req.params;
    // Lógica para agregar un producto a un carrito en "carrito.json"
    const productoAgregadoAlCarrito = await agregarProductoAlCarrito(cid, pid);
    res.json(productoAgregadoAlCarrito);
} catch (error) {
    res.status(400).json({ error: 'Error al agregar el producto al carrito.' });
}
});

// Montar los routers
app.use('/api/products', productosRouter);
app.use('/api/carts', carritosRouter);

// Funciones de utilidad para la manipulación de datos
async function obtenerProductos() {
const productosData = await fs.readFile('productos.json', 'utf-8');
return JSON.parse(productosData);
}

async function obtenerProductoPorId(pid) {
const productos = await obtenerProductos();
return productos.find((producto) => producto.id === pid);
}

async function agregarProducto(nuevoProducto) {
const productos = await obtenerProductos();
nuevoProducto.id = generarIdUnico();
productos.push(nuevoProducto);
await fs.writeFile('productos.json', JSON.stringify(productos, null, 2));
return nuevoProducto;
}

async function obtenerProductosEnCarrito(cid) {
const carritosData = await fs.readFile('carrito.json', 'utf-8');
const carritos = JSON.parse(carritosData);
const carrito = carritos.find((c) => c.id === cid);
return carrito ? carrito.products : [];
}

async function agregarProductoAlCarrito(cid, pid) {
const carritos = await obtenerCarritos();
const carrito = carritos.find((c) => c.id === cid);

if (carrito) {
    const productoExistente = carrito.products.find((p) => p.product === pid);
    if (productoExistente) {
    productoExistente.quantity++;
    } else {
    carrito.products.push({ product: pid, quantity: 1 });
    }

    await fs.writeFile('carrito.json', JSON.stringify(carritos, null, 2));
    return carrito.products;
} else {
    return { error: 'Carrito no encontrado.' };
}
}

// Iniciar el servidor
app.listen(PORT, () => {
console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Función de utilidad para generar un ID único (puedes ajustarla según tus necesidades)
function generarIdUnico() {
return Math.random().toString(36).substr(2, 9);
}
