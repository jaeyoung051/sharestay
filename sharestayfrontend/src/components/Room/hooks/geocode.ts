// src/components/Room/hooks/geocode.ts

export const geocode = (
  address: string
): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      return reject(new Error("카카오맵 SDK가 로드되지 않았습니다."));
    }

    const geocoder = new window.kakao.maps.services.Geocoder();

    geocoder.addressSearch(address, (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        if (result[0]) {
          resolve({ lat: Number(result[0].y), lng: Number(result[0].x) });
        } else {
          reject(new Error("주소에 해당하는 좌표를 찾을 수 없습니다."));
        }
      } else {
        reject(new Error("주소 검색에 실패했습니다."));
      }
    });
  });
};
