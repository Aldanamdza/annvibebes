document.addEventListener('DOMContentLoaded', function() {
    // Obtener referencia al elemento donde se mostrará el total del carrito
    const totalCarritoElement = document.getElementById('totalCarrito');
    // Obtener referencia a la lista donde se mostrarán los productos del carrito
    const listaCarritoElement = document.getElementById('lista-carrito');
    // Selectores para el contador del carrito y el mensaje flotante (IDs corregidos para coincidir con HTML)
    const cartCountSpan = document.getElementById('contador-car');
    const addedToCartMessage = document.getElementById('mensaje-carrito');
    const cartDropdown = document.getElementById('cart-dropdown');
    const cartIcon = document.getElementById('cart-icon');

    // --- Inicia la función cargarCarrito ---
    // Función para cargar y mostrar los productos del carrito
    function cargarCarrito() {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        let total = 0;
        let totalItems = 0;

        // Limpiar la lista actual del carrito en el HTML
        listaCarritoElement.innerHTML = '';

        if (carrito.length === 0) {
            listaCarritoElement.innerHTML = '<li>El carrito está vacío.</li>'; // Mensaje si el carrito está vacío
        } else {
            carrito.forEach(item => {
                const precioNumerico = parseFloat(item.precio) || 0;
                const cantidad = item.cantidad || 1;

                const li = document.createElement('li');
                li.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
                        <span>${item.nombre} (Talle: ${item.talle}) (Pack: ${item.pack}) - $${(precioNumerico * cantidad).toFixed(2)}</span>
                        <div style="display: flex; align-items: center;">
                            <button class="restar-cantidad" data-unique-id="${item.uniqueId}" style="margin-right: 5px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 3px; padding: 3px 8px;">-</button>
                            <span style="font-weight: bold; margin: 0 5px;">${cantidad}</span>
                            <button class="sumar-cantidad" data-unique-id="${item.uniqueId}" style="margin-left: 5px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 3px; padding: 3px 8px;">+</button>
                            <button class="eliminar-del-carrito" data-unique-id="${item.uniqueId}" style="margin-left: 15px; background: red; color: white; border: none; border-radius: 3px; padding: 5px 10px; cursor: pointer;">Quitar</button>
                        </div>
                    </div>
                `;
                listaCarritoElement.appendChild(li);

                total += precioNumerico * cantidad;
                totalItems += cantidad;
            });
        }

        // Actualizar el total en el HTML
        totalCarritoElement.textContent = total.toFixed(2);

        // Actualizar el contador del carrito en el header
        cartCountSpan.textContent = totalItems;
        if (totalItems > 0) {
            cartCountSpan.style.display = 'inline-block';
        } else {
            cartCountSpan.style.display = 'none';
        }
    }
    // --- Fin de la función cargarCarrito ---

    // --- Nuevas funciones para sumar y restar cantidad ---
    function ajustarCantidad(uniqueId, operacion) {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const productoIndex = carrito.findIndex(item => item.uniqueId === uniqueId);

        if (productoIndex !== -1) {
            if (operacion === 'sumar') {
                carrito[productoIndex].cantidad++;
            } else if (operacion === 'restar') {
                if (carrito[productoIndex].cantidad > 1) {
                    carrito[productoIndex].cantidad--;
                } else {
                    // Si la cantidad es 1 y se resta, se elimina el producto del carrito
                    carrito = carrito.filter(item => item.uniqueId !== uniqueId);
                }
            }
            localStorage.setItem('carrito', JSON.stringify(carrito));
            cargarCarrito(); // Volver a cargar el carrito para reflejar los cambios
        }
    }
    // --- Fin de las nuevas funciones para sumar y restar cantidad ---


    // Función para mostrar el mensaje flotante de "Producto agregado"
    function showAddedToCartMessage() {
        if (addedToCartMessage) {
            addedToCartMessage.classList.add('show');
            setTimeout(() => {
                addedToCartMessage.classList.remove('show');
            }, 2000);
        }
    }

    // --- Inicia la función agregarProducto ---
    function agregarProducto(event) {
        const boton = event.target;
        const productoDiv = boton.closest('.producto');

        // Capturar Talle y Pack de forma más precisa
        const selectedOptionDiv = productoDiv.querySelector('.card-option.selected');

        if (!selectedOptionDiv) {
            alert("Por favor seleccioná una opción de pack antes de agregar al carrito.");
            return;
        }

        const packTextoCompleto = selectedOptionDiv.textContent.trim(); // Obtener el texto completo, ej. "Talle P x32u" o "48u"
        const precioSeleccionado = selectedOptionDiv.dataset.precio;

        // NUEVA LÓGICA: Extraer solo la letra del talle
        let talleLetra = ''; // Inicializamos vacío
        const matchTalleLetra = packTextoCompleto.match(/Talle\s+([A-Z]{1,3})/i); // Busca "Talle " seguido de una letra mayúscula
        if (matchTalleLetra && matchTalleLetra[1]) {
            talleLetra = matchTalleLetra[1].toUpperCase(); // Captura solo la letra y la convierte a mayúscula
        } else {
            // Si no se encuentra un "Talle X" explícito, puedes dejarlo vacío o poner un valor por defecto
            talleLetra = 'N/A'; // O "" si prefieres que no se muestre nada
        }

        // NUEVA LÓGICA: Extraer solo las unidades del pack
        let packUnidades = ''; // Inicializamos vacío
        const matchPackUnidades = packTextoCompleto.match(/(\d+u)/i); // Busca uno o más dígitos seguidos de 'u'
        if (matchPackUnidades && matchPackUnidades[1]) {
            packUnidades = matchPackUnidades[1]; // Captura solo las unidades (ej. "32u", "48u")
        } else {
            // Si no se encuentran unidades (ej. "32u"), puedes dejarlo vacío o poner un valor por defecto
            packUnidades = 'N/A'; // O "" si prefieres que no se muestre nada
        }

        // Crear un identificador único para evitar duplicados
        // Usamos talleLetra y packUnidades para el uniqueId para que sean más específicos
        const uniqueId = `${boton.getAttribute('data-id')}-${talleLetra}-${packUnidades}`;
        const nombreProductoBase = boton.getAttribute('data-nombre');

        let productoNuevo = {
            uniqueId: uniqueId,
            id: boton.getAttribute('data-id'),
            nombre: nombreProductoBase,
            precio: parseFloat(precioSeleccionado),
            talle: talleLetra, 
            pack: packUnidades,    // Usamos las unidades extraídas
            cantidad: 1
        };

        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

        const productoExistenteIndex = carrito.findIndex(item => item.uniqueId === productoNuevo.uniqueId);

        if (productoExistenteIndex !== -1) {
            carrito[productoExistenteIndex].cantidad++;
        } else {
            carrito.push(productoNuevo);
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));

        cargarCarrito(); // Actualizar carrito
        showAddedToCartMessage(); // Mostrar mensaje "Producto agregado"
    }
    // --- Fin de la función agregarProducto ---

    // --- Lógica para seleccionar packs ---
    const packOptions = document.querySelectorAll('.card-option');

    // --- Selección de pack: copia valor y precio al botón ---
    packOptions.forEach(option => {
        option.addEventListener('click', () => {
            const parentPack = option.closest('.pack');
            if (!parentPack) return;

            // Marcar visualmente
            parentPack.querySelectorAll('.card-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');

            // Guardar pack elegido en input hidden
            const hiddenInput = parentPack.querySelector('input[type="hidden"][name="opciones"]');
            if (hiddenInput) hiddenInput.value = option.dataset.value;

            // *** NUEVO: actualizar data-precio del botón Comprar ***
            const precioPack = option.dataset.precio;
            const btnComprar = parentPack.closest('.producto').querySelector('.comprar');
            if (btnComprar) btnComprar.setAttribute('data-precio', precioPack);
        });
    });

    // --- Inicia la función pagar ---
    function pagar() {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

        if (carrito.length === 0) {
            alert("El carrito está vacío");
            return;
        }
        let total = 0;
        // Iterar sobre el carrito para calcular el total considerando la cantidad
        for (let i = 0; i < carrito.length; i++) {
            total += (parseFloat(carrito[i].precio) || 0) * (carrito[i].cantidad || 1);
        }
        localStorage.setItem('productos', JSON.stringify(carrito));
        localStorage.setItem('total', total.toFixed(2));
        alert(`Total a pagar: $${total.toFixed(2)}`);
        window.location.href = "compra.html";
    }
    // --- Fin de la función pagar ---

    cartIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        cartDropdown.classList.toggle('open');
    });

    document.addEventListener('click', () =>
        cartDropdown.classList.remove('open'));

    cartDropdown.addEventListener('click', (e) => e.stopPropagation());

    // Asigna evento clic a todos los botones con la clase "comprar" del HTML
    let botonesComprar = document.getElementsByClassName('comprar');
    for (let i = 0; i < botonesComprar.length; i++) {
        botonesComprar[i].addEventListener('click', agregarProducto);
    }

    // Manejar clics para eliminar productos del carrito
    listaCarritoElement.addEventListener('click', (event) => {
        if (event.target.classList.contains('eliminar-del-carrito')) {
            const uniqueIdAEliminar = event.target.dataset.uniqueId;

            let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            carrito = carrito.filter(producto => producto.uniqueId !== uniqueIdAEliminar);
            localStorage.setItem('carrito', JSON.stringify(carrito));
            cargarCarrito(); // Recargar el carrito para reflejar la eliminación
        } else if (event.target.classList.contains('sumar-cantidad')) {
            const uniqueId = event.target.dataset.uniqueId;
            ajustarCantidad(uniqueId, 'sumar');
        } else if (event.target.classList.contains('restar-cantidad')) {
            const uniqueId = event.target.dataset.uniqueId;
            ajustarCantidad(uniqueId, 'restar');
        }
    });

    // Vacía carrito
    document.getElementById('vaciar-carrito').addEventListener('click', function() {
        localStorage.removeItem('carrito');
        cargarCarrito(); // Actualizar la visualización y el contador después de vaciar
    });

    // Asignar el evento al botón de pagar (cuando el DOM esté listo)
    document.getElementById('btnPagar').addEventListener('click', pagar);

    cargarCarrito(); // Cargar el carrito al iniciar la página y actualizar el contador

    document.addEventListener('click', function(event) {
        // Verifica si el clic fue fuera de cualquier ".pack"
        if (!event.target.closest('.pack')) {
            // Deselecciona todos los packs seleccionados
            document.querySelectorAll('.card-option.selected').forEach(el => {
                el.classList.remove('selected');
            });

            // Limpia los valores de los campos ocultos de opciones
            document.querySelectorAll('input[type="hidden"][name="opciones"]').forEach(input => {
                input.value = '';
            });
        }
    });
});