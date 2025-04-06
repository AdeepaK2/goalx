export enum SriLankanProvince {
  CENTRAL = "Central Province",
  EASTERN = "Eastern Province",
  NORTH_CENTRAL = "North Central Province",
  NORTHERN = "Northern Province",
  NORTH_WESTERN = "North Western Province",
  SABARAGAMUWA = "Sabaragamuwa Province",
  SOUTHERN = "Southern Province",
  UVA = "Uva Province",
  WESTERN = "Western Province"
}

export enum SriLankanDistrict {
  AMPARA = "Ampara",
  ANURADHAPURA = "Anuradhapura",
  BADULLA = "Badulla",
  BATTICALOA = "Batticaloa",
  COLOMBO = "Colombo",
  GALLE = "Galle",
  GAMPAHA = "Gampaha",
  HAMBANTOTA = "Hambantota",
  JAFFNA = "Jaffna",
  KALUTARA = "Kalutara",
  KANDY = "Kandy",
  KEGALLE = "Kegalle",
  KILINOCHCHI = "Kilinochchi",
  KURUNEGALA = "Kurunegala",
  MANNAR = "Mannar",
  MATALE = "Matale",
  MATARA = "Matara",
  MONARAGALA = "Monaragala",
  MULLAITIVU = "Mullaitivu",
  NUWARA_ELIYA = "Nuwara Eliya",
  POLONNARUWA = "Polonnaruwa",
  PUTTALAM = "Puttalam",
  RATNAPURA = "Ratnapura",
  TRINCOMALEE = "Trincomalee",
  VAVUNIYA = "Vavuniya"
}

// Map districts to their respective provinces
export const ProvinceDistrictMap: Record<SriLankanProvince, SriLankanDistrict[]> = {
  [SriLankanProvince.WESTERN]: [
    SriLankanDistrict.COLOMBO,
    SriLankanDistrict.GAMPAHA,
    SriLankanDistrict.KALUTARA
  ],
  [SriLankanProvince.CENTRAL]: [
    SriLankanDistrict.KANDY,
    SriLankanDistrict.MATALE,
    SriLankanDistrict.NUWARA_ELIYA
  ],
  [SriLankanProvince.SOUTHERN]: [
    SriLankanDistrict.GALLE,
    SriLankanDistrict.MATARA,
    SriLankanDistrict.HAMBANTOTA
  ],
  [SriLankanProvince.NORTHERN]: [
    SriLankanDistrict.JAFFNA,
    SriLankanDistrict.KILINOCHCHI,
    SriLankanDistrict.MANNAR,
    SriLankanDistrict.MULLAITIVU,
    SriLankanDistrict.VAVUNIYA
  ],
  [SriLankanProvince.EASTERN]: [
    SriLankanDistrict.AMPARA,
    SriLankanDistrict.BATTICALOA,
    SriLankanDistrict.TRINCOMALEE
  ],
  [SriLankanProvince.NORTH_WESTERN]: [
    SriLankanDistrict.KURUNEGALA,
    SriLankanDistrict.PUTTALAM
  ],
  [SriLankanProvince.NORTH_CENTRAL]: [
    SriLankanDistrict.ANURADHAPURA,
    SriLankanDistrict.POLONNARUWA
  ],
  [SriLankanProvince.UVA]: [
    SriLankanDistrict.BADULLA,
    SriLankanDistrict.MONARAGALA
  ],
  [SriLankanProvince.SABARAGAMUWA]: [
    SriLankanDistrict.KEGALLE,
    SriLankanDistrict.RATNAPURA
  ]
};

// Helper function to validate district-province relationship
export function districtBelongsToProvince(
  district: SriLankanDistrict,
  province: SriLankanProvince
): boolean {
  return ProvinceDistrictMap[province].includes(district);
}

// Type for full location structure
export interface Location {
  district: SriLankanDistrict;
  division: string;
  province: SriLankanProvince;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}