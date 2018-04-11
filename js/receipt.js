function genReceipt (cart, order, orderId) {
  let invoiceNumber = order.id
  let items = order.items.filter(i => i.type === 'sku').map(item => {
    let thisItem = cart[item.parent]
    thisItem.sub = Number(thisItem.quantity) * Number(thisItem.price)
    return thisItem
  })
  let subtotal = items.map(s => s.sub).reduce((a, b) => a + b, 0).toFixed(2)
  let gst = Number(order.items.filter(i => i.type === 'tax')[0])
  let shipping = Number(order.items.filter(i => i.type === 'shipping')[0])
  let grandTotal = order.amount / 100
  let today = new Date().toISOString().substring(0, 10)

  var columns = [
    {title: "", dataKey: "img"},
    {title: "Product", dataKey: "title"},
    {title: "Description", dataKey: "description"},
    {title: "Qty", dataKey: "quantity"},
    {title: "Price", dataKey: "price"},
    {title: "Subtotal", dataKey: "sub"}
  ];

  var doc = new jsPDF('p', 'pt')
  var images = []
  doc.addImage(thumbs.logo, 'PNG', 40, 30, 120, 120);

  // ES Info
  doc.setFontSize(12)
  doc.text(["Earth Sun Organics ltd", "55 union bay hwy", "Union Bay BC", "V3L 0A8", today], 220, 80)
  // invoice details
  doc.text([order.shipping.name, `${order.shipping.address.line1} ${order.shipping.address.postal_code}`, `${invoiceNumber}`, `${orderId}`, `Total: ${grandTotal.toFixed(2)}`], 400, 80)
  doc.setFontStyle('normal')
  doc.setFontSize(12)
  doc.autoTable(columns, items, {
    theme: 'grid',
    startY: 200,
    tableWidth: 460,
    drawRow: function (row, data) {
      row.height = 80
    },
    drawCell: function(cell, opts) {
      if (opts.column.dataKey === 'img') {
        cell.width = 80
        let thumb = opts.row.raw.title === 'Sun Child' ? 'chi' : opts.row.raw.title.substring(0, 3).toLowerCase()
        images.push({
          url: thumbs[thumb],
          x: cell.textPos.x,
          y: cell.textPos.y
        });
      } else if (opts.column.dataKey === 'quantity') {
        cell.width = 40
      }
    },
    drawHeaderCell: function (cell, data) {
      if (cell.raw.dataKey === 'img') {
        cell.width = 80
      } else if (cell.raw.dataKey === 'quantity') {
        cell.width = 40
      }
    },
    addPageContent: function() {
      for (var i = 0; i < images.length; i++) {
        doc.addImage(images[i].url, 'PNG', images[i].x, images[i].y, 75, 60);
      }
    }
  })
  doc.save(`EarthSun_receipt_${today}.pdf`)
}
