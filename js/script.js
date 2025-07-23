document.addEventListener('DOMContentLoaded', function() {

    const totalCarritoElement = document.getElementById('totalCarrito');
    const listaCarritoElement = document.getElementById('lista-carrito');
    const cartCountSpan = document.getElementById('contador-car');
    const addedToCartMessage = document.getElementById('mensaje-carrito');
    const cartDropdown = document.getElementById('cart-dropdown');
    const cartIcon = document.getElementById('cart-icon');
    const vaciarCarritoButton = document.getElementById('vaciar-carrito');
    const pagarButton = document.getElementById('btnPagar');

    function saveCartToLocalStorage(carrito) {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    function getCartFromLocalStorage() {
        return JSON.parse(localStorage.getItem('carrito')) || [];
    }

    function showAddedToCartMessage() {
        if (addedToCartMessage) {
            addedToCartMessage.classList.add('show');
            setTimeout(() => {
                addedToCartMessage.classList.remove('show');
            }, 2000);
        }
    }

    function ajustarCantidad(uniqueId, operacion) {
        let carrito = getCartFromLocalStorage();
        const productoIndex = carrito.findIndex(item => item.uniqueId === uniqueId);

        if (productoIndex !== -1) {
            if (operacion === 'sumar') {
                carrito[productoIndex].cantidad++;
            } else if (operacion === 'restar') {
                if (carrito[productoIndex].cantidad > 1) {
                    carrito[productoIndex].cantidad--;
                } else {
                    carrito.splice(productoIndex, 1);
                }
            }
            saveCartToLocalStorage(carrito);
            cargarCarrito();
        }
    }

    function cargarCarrito() {
        let carrito = getCartFromLocalStorage();
        let total = 0;
        let totalItems = 0;

        listaCarritoElement.innerHTML = '';

        if (carrito.length === 0) {
            listaCarritoElement.innerHTML = '<li class="text-gray-500 text-center py-4">El carrito está vacío.</li>';
        } else {
            carrito.forEach(item => {
                const precioNumerico = parseFloat(item.precio) || 0;
                const cantidad = item.cantidad || 1;

                const li = document.createElement('li');
                li.className = 'py-2 border-b border-gray-200 last:border-b-0';
                li.innerHTML = `
                    <div class="flex items-center justify-between flex-wrap ">
                        <span class="text-gray-800 font-medium flex-1 mr-2">${item.nombre} ${item.talle && item.talle !== 'N/A' ? `(Talle: ${item.talle})` : ''} ${item.pack && item.pack !== 'N/A' ? `(Pack: ${item.pack})` : ''}</span>
                        <span class="text-green-600 font-semibold">$${(precioNumerico * cantidad).toFixed(2)}</span>
                        <div class="flex items-center mt-2 w-full justify-end">
                            <button class="restar-cantidad bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded-l" data-unique-id="${item.uniqueId}">-</button>
                            <span class="bg-white border-y border-gray-200 text-gray-800 font-bold py-1 px-3">${cantidad}</span>
                            <button class="sumar-cantidad bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded-r" data-unique-id="${item.uniqueId}">+</button>
                            <button class="eliminar-del-carrito ml-4 bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded" data-unique-id="${item.uniqueId}">Quitar</button>
                        </div>
                    </div>
                `;
                listaCarritoElement.appendChild(li);

                total += precioNumerico * cantidad;
                totalItems += cantidad;
            });
        }

        totalCarritoElement.textContent = total.toFixed(2);
        cartCountSpan.textContent = totalItems;
        cartCountSpan.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }

    // Funcion agregarProducto ---
   function agregarProducto(event) {
    const boton = event.target;
    const productoDiv = boton.closest('.producto');

    // Determinar si el producto actual debería tener opciones de pack
    // Esto se basa en si hay elementos .card-option dentro de su .producto div
    const cardOptions = productoDiv.querySelectorAll('.card-option');
    const tieneOpcionesDePack = cardOptions.length > 0;

    let selectedOptionDiv = null;
    if (tieneOpcionesDePack) {
        selectedOptionDiv = productoDiv.querySelector('.card-option.selected');
        // Si tiene opciones de pack, pero ninguna está seleccionada, mostramos una alerta y salimos.
        if (!selectedOptionDiv) {
            alert("Por favor, selecciona una opción de pack antes de agregar al carrito.");
            return; // Salir si falta una selección de pack.
        }
    }

    let precioSeleccionado;
    let talleLetra = 'N/A';
    let packUnidades = 'N/A';
    let nombreProductoBase;
    let uniqueId;

    if (selectedOptionDiv) {
        // Es un producto con packs (como los pañales) y una opción fue seleccionada
        const packTextoCompleto = selectedOptionDiv.textContent.trim();
        precioSeleccionado = selectedOptionDiv.dataset.precio;

        const matchTalleLetra = packTextoCompleto.match(/Talle\s([A-Z]+)/i);
        if (matchTalleLetra && matchTalleLetra[1]) {
            talleLetra = matchTalleLetra[1].toUpperCase();
        }

        const matchPackUnidades = packTextoCompleto.match(/(\d+u)/i);
        if (matchPackUnidades && matchPackUnidades[1]) {
            packUnidades = matchPackUnidades[1];
        }

        nombreProductoBase = boton.getAttribute('data-nombre');
        uniqueId = `${boton.getAttribute('data-id')}-${talleLetra}-${packUnidades}`;

    } else {
        // Es un producto individual (o un producto con packs que no tiene opciones seleccionables,
        // pero que por algún motivo se decidió manejar aquí si no hay 'card-option's)
        precioSeleccionado = boton.getAttribute('data-precio');
        nombreProductoBase = boton.getAttribute('data-nombre');
        uniqueId = boton.getAttribute('data-id'); // Para productos individuales
        if (!precioSeleccionado) {
            const precioElement = productoDiv.querySelector('.precio-producto');
            if (precioElement) {
                precioSeleccionado = precioElement.textContent.replace('$', '');
            }
            console.warn("Advertencia: 'data-precio' no encontrado en el botón. Intentando obtenerlo del elemento '.precio-producto'.");
        }
    }

    // Validar que tenemos un precio antes de continuar
    if (!precioSeleccionado || isNaN(parseFloat(precioSeleccionado))) {
        alert("No se pudo obtener el precio del producto. Por favor, revisa la configuración del HTML.");
        console.error("Error: Precio no válido o no encontrado para el producto.", {boton, selectedOptionDiv, precioSeleccionado});
        return;
    }

    let productoNuevo = {
        uniqueId: uniqueId,
        id: boton.getAttribute('data-id'),
        nombre: nombreProductoBase,
        precio: parseFloat(precioSeleccionado),
        talle: talleLetra,
        pack: packUnidades,
        cantidad: 1
    };

    let carrito = getCartFromLocalStorage();

    const productoExistenteIndex = carrito.findIndex(item => item.uniqueId === productoNuevo.uniqueId);

    if (productoExistenteIndex !== -1) {
        carrito[productoExistenteIndex].cantidad++;
    } else {
        carrito.push(productoNuevo);
    }

    saveCartToLocalStorage(carrito);
    cargarCarrito();
    showAddedToCartMessage();
}
    // --- FIN agregarProducto ---

    // Lógica para seleccionar packs (solo relevante para pañales.html)
    document.querySelectorAll('.card-option').forEach(option => {
        option.addEventListener('click', () => {
            const parentPack = option.closest('.pack');
            if (!parentPack) return;

            parentPack.querySelectorAll('.card-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');

            const hiddenInput = parentPack.querySelector('input[type="hidden"][name="opciones"]');
            if (hiddenInput) hiddenInput.value = option.dataset.value;

            const precioPack = option.dataset.precio;
            const btnComprar = parentPack.closest('.producto').querySelector('.comprar');
            if (btnComprar) btnComprar.setAttribute('data-precio', precioPack);
        });
    });

    function pagar() {
        let carrito = getCartFromLocalStorage();

        if (carrito.length === 0) {
            alert("El carrito está vacío. No puedes finalizar una compra sin productos.");
            return;
        }

        let total = carrito.reduce((sum, item) => sum + (parseFloat(item.precio) || 0) * (item.cantidad || 1), 0);

        localStorage.setItem('productos', JSON.stringify(carrito));
        localStorage.setItem('total', total.toFixed(2));

        alert(`Total a pagar: $${total.toFixed(2)}. Redirigiendo a la página de compra...`);
        window.location.href = "compra.html";
    }
  
    if (cartIcon && cartDropdown) {
        cartIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            cartDropdown.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (cartDropdown.classList.contains('open') && !cartDropdown.contains(e.target) && !cartIcon.contains(e.target)) {
                cartDropdown.classList.remove('open');
            }
        });

        cartDropdown.addEventListener('click', (e) => e.stopPropagation());
    }

    document.querySelectorAll('.btn-comprar').forEach(button => {
        button.addEventListener('click', agregarProducto);
    });

listaCarritoElement.addEventListener('click', (event) => {
                if (event.target.classList.contains('eliminar-del-carrito')) {
            const uniqueIdAEliminar = event.target.dataset.uniqueId;
            let carrito = getCartFromLocalStorage();
            carrito = carrito.filter(producto => producto.uniqueId !== uniqueIdAEliminar);
            saveCartToLocalStorage(carrito);
            cargarCarrito();
        } else if (event.target.classList.contains('sumar-cantidad')) {
            const uniqueId = event.target.dataset.uniqueId;
            ajustarCantidad(uniqueId, 'sumar');
        } else if (event.target.classList.contains('restar-cantidad')) {
            const uniqueId = event.target.dataset.uniqueId;
            ajustarCantidad(uniqueId, 'restar');
        }
    });

    if (vaciarCarritoButton) {
        vaciarCarritoButton.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
                localStorage.removeItem('carrito');
                cargarCarrito();
            }
        });
    }

    if (pagarButton) {
        pagarButton.addEventListener('click', pagar);
    }

    // Inicialización
    cargarCarrito();

    // Listener para deseleccionar packs si se hace clic fuera de cualquier '.pack'
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.pack') && !event.target.closest('#cart-dropdown') && cartDropdown.classList.contains('open') === false) {
            document.querySelectorAll('.card-option.selected').forEach(el => {
                el.classList.remove('selected');
            });
            document.querySelectorAll('input[type="hidden"][name="opciones"]').forEach(input => {
                input.value = '';
            });
        }
    });
});

