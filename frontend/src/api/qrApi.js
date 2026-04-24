export const qrApi = {
  verify: (token) =>
    fetch(`/api/qr/verify/${token}`)
      .then(res => res.json())
      .then(data => ({ data })),
}