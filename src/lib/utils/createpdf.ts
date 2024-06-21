import jsPDF from "jspdf";
import Logo from "../assets/fullLogoNegro.png";
import autoTable, { type FontStyle, type RowInput } from "jspdf-autotable";
import type { Facturas, Reportes, Trackings, Usuarios } from "@prisma/client";
import { getToday, dateToLocaleString } from "./datehandler";

function generateBase64(file: Blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

export async function createInvoice(
  info: Factura | VerFacturas | (Facturas & { trackings: Trackings[] }),
  factura_id: number,
  cliente: Usuarios | Cliente,
  descargar = false,
  reenviar = false
) {
  let trackings = info.trackings.map(({ numero_tracking, peso, precio }) => [
    numero_tracking,
    String(peso),
    String(precio.toFixed(2)),
  ]);

  let totalSum = 0;

  info.trackings.forEach((tracking) => {
    totalSum += tracking.precio;
  });

  let total = totalSum.toFixed(2);

  const doc = new jsPDF("p", "pt", "a4", true);

  doc.addImage(Logo, "PNG", 40, 40, 145, 56, "", "FAST");
  autoTable(doc, {
    body: [
      [
        {
          content: "FACTURA",
          styles: {
            halign: "right",
            fontSize: 20,
          },
        },
      ],
    ],
    theme: "plain",
  });

  let fecha = dateToLocaleString(getToday());

  if (descargar || reenviar) {
    info = info as VerFacturas;
    fecha = info.fecha;
  }

  autoTable(doc, {
    body: [
      [
        {
          content: `Factura No. ${factura_id}`,
          styles: {
            halign: "right",
            fontSize: 14,
            textColor: "red",
            fontStyle: "bold",
          },
        },
      ],
      [
        {
          content: `Fecha: ${fecha}`,
          styles: {
            halign: "right",
            fontSize: 14,
          },
        },
      ],
    ],
    styles: {
      cellPadding: { top: 0, bottom: 0, left: 5, right: 5 },
    },
    theme: "plain",
  });

  autoTable(doc, {
    head: [
      [
        {
          content: `${cliente.nombre} ${cliente.apellido}`,
          styles: {
            halign: "left",
            fontSize: 13,
          },
        },
        "",
      ],
    ],
    body: [
      [
        {
          content: `Casillero: ${info.casillero}`,
          styles: {
            halign: "left",
            fontSize: 13,
          },
        },
        {
          content: `Total: $${total}`,
          styles: {
            fontSize: 16,
            halign: "right",
            fontStyle: "bold",
          },
        },
      ],
    ],
    theme: "plain",
    styles: {
      cellPadding: { left: 5, right: 5, top: 0, bottom: 0 },
    },
  });

  autoTable(doc, {
    head: [
      [
        {
          content: "Numero de Tracking",
          styles: { halign: "left" },
        },
        "Peso (lbs)",
        "Total",
      ],
    ],
    body: trackings,
    theme: "striped",
    headStyles: {
      fillColor: "#343a40",
      halign: "right",
    },
    columnStyles: {
      0: { overflow: "linebreak" },
      1: { halign: "right", cellWidth: 60 },
      2: { halign: "right", cellWidth: 60 },
    },
  });

  autoTable(doc, {
    body: [
      [
        {
          content: "Subtotal:",
          styles: { halign: "right", fontStyle: "bold" },
        },
        { content: `$${total}`, styles: { halign: "right" } },
      ],
      [
        {
          content: "Total:",
          styles: {
            halign: "right",
            fontStyle: "bold",
          },
        },
        {
          content: `$${total}`,
          styles: {
            halign: "right",
          },
        },
      ],
    ],
    columnStyles: {
      1: { cellWidth: 100 },
    },
    styles: {
      fontSize: 12,
    },
    theme: "plain",
  });

  autoTable(doc, {
    head: [["Terminos y Condiciones"]],
    body: [
      [
        "\u2022 XCargoServices aplica cargos por peso o volumen para cargas extra dimensionada.",
      ],
      [
        "\u2022 XCargoServices no se hará responsable por daño en mercancia mal empacada por exportación.",
      ],
      [
        "\u2022 XCargoServices no se hace responsable por mercancia extraviada entregada por USPS.",
      ],
      [
        "\u2022 XCargoServices no se hace responsable por paquetes, despues de 1 mes de no ser retirado en la oficina.",
      ],
    ],
    headStyles: {
      fontSize: 13,
    },
    styles: { cellPadding: 4 },
    theme: "plain",
    pageBreak: "avoid",
  });

  autoTable(doc, {
    body: [
      ["Entregado por:___________________", "Recibido por:___________________"],
    ],
    theme: "plain",
    pageBreak: "avoid",
  });

  autoTable(doc, {
    head: [["Datos Bancarios para Transferencia"]],
    body: [
      ["Banco General"],
      ["Nombre: Edwin Antonio Zhong Zhu"],
      ["Tipo de Cuenta: Ahorros"],
      ["Cuenta: 0433970068697"],
    ],
    styles: { halign: "center" },
    pageBreak: "avoid",
    theme: "plain",
  });

  autoTable(doc, {
    didDrawPage: function (data) {
      let numero = "+507 6362-8879";
      let direccion =
        "La Chorrera, La Mata del Coco, Local No. 2, al lado de Servicentro Pepe";

      if ((cliente as Usuarios).sucursal === "Dos Mares") {
        numero = "+507 6396-0009";
        direccion =
          "El Dorado, Dos Mares, Calle circunvalacion PH Elite 500 local 2, dentro de 'Baixing Market'";
      }

      let str = `XCargoServices | Teléfono ${numero}\n${direccion}`;
      doc.setFontSize(11);

      var pageSize = doc.internal.pageSize;
      var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      doc.text(str, data.settings.margin.left, pageHeight - 40);
    },
  });

  if (descargar) {
    doc.save(`Factura-${factura_id}.pdf`);
  }

  const base = await generateBase64(doc.output("blob"));
  return base;
}

export async function createReport(
  reporte: Reportes,
  facturas: Facturas[],
  descargar = false
) {
  const doc = new jsPDF("p", "pt", "a4", true);

  doc.addImage(Logo, "PNG", 40, 40, 145, 56, "", "FAST");
  autoTable(doc, {
    body: [
      [
        {
          content: "Reporte",
          styles: {
            halign: "right",
            fontSize: 20,
          },
        },
      ],
    ],
    theme: "plain",
  });

  let fechaInicial = reporte.fechaInicial.toLocaleDateString("en-GB");
  let fechaFinal = reporte.fechaFinal.toLocaleDateString("en-GB");

  let fechas: RowInput[] = [];

  fechas.push([
    {
      content: `Reporte No. ${reporte.reporte_id}`,
      styles: {
        halign: "right",
        fontSize: 14,
        textColor: "red",
        fontStyle: "bold" as FontStyle,
      },
    },
  ]);

  if (fechaInicial === fechaFinal) {
    fechas.push([
      {
        content: `Fecha: ${fechaInicial}`,
        styles: {
          halign: "right",
          fontSize: 14,
        },
      },
    ]);
  } else {
    fechas.push([
      {
        content: `Desde: ${fechaInicial}`,
        styles: {
          halign: "right",
          fontSize: 14,
        },
      },
    ]);

    fechas.push([
      {
        content: `Hasta: ${fechaFinal}`,
        styles: {
          halign: "right",
          fontSize: 14,
        },
      },
    ]);
  }

  autoTable(doc, {
    body: fechas,
    styles: {
      cellPadding: { top: 0, bottom: 0, left: 5, right: 5 },
    },
    theme: "plain",
  });

  autoTable(doc, {
    head: [
      [
        {
          content: "",
          styles: {
            halign: "left",
            fontSize: 13,
          },
        },
        "",
      ],
    ],
    body: [
      [
        {
          content: "",
          styles: {
            halign: "left",
            fontSize: 13,
          },
        },
        {
          content: `Total: $${reporte.total.toFixed(2)}`,
          styles: {
            fontSize: 16,
            halign: "right",
            fontStyle: "bold",
          },
        },
      ],
    ],
    theme: "plain",
    styles: {
      cellPadding: { left: 5, right: 5, top: 0, bottom: 0 },
    },
  });

  let listaDeFacturas = facturas.map((factura) => {
    let estado = factura.pagado ? "Pagado" : "Pendiente";

    return [
      factura.fecha,
      factura.casillero,
      String(factura.factura_id),
      String(factura.total.toFixed(2)),
      String(factura.metodo_de_pago),
      estado,
      String(factura.pagadoAt?.toLocaleDateString("en-GB")),
    ];
  });

  autoTable(doc, {
    head: [
      [
        { content: "Fecha", styles: { halign: "left" } },
        "Casillero",
        "Factura Nº",
        "Total",
        "Metodo de Pago",
        "Estado de Pago",
        "Fecha de Pago",
      ],
    ],
    body: listaDeFacturas,
    theme: "striped",
    headStyles: {
      fillColor: "#343a40",
      halign: "right",
    },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
    },
  });

  if (descargar) {
    doc.save(`Reporte-${reporte.reporte_id}.pdf`);
  }

  const base = await generateBase64(doc.output("blob"));
  return base;
}
