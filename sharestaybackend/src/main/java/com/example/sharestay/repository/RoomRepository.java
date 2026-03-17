package com.example.sharestay.repository;

import com.example.sharestay.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    /*
        검색 필터가 여러 개고 nullable 필드가 있으니 JPQL 동적 쿼리로 짜는 게 좋음.
        Spring Data JPA의 @Query + COALESCE() 트릭을 쓰면 깔끔하게 됨

        전에 코드는 가격 설정만 들어가 있어서 다른 건 키워드로 검색이 안 됐음
     */

    @Query("""
      SELECT r
      FROM Room r
      WHERE (:region IS NULL OR r.address LIKE CONCAT('%', :region, '%'))
        AND (:district IS NULL OR r.address LIKE CONCAT('%', :district, '%'))
        AND (:type IS NULL OR r.type = :type)
        AND (:minPrice IS NULL OR r.rentPrice >= :minPrice)
        AND (:maxPrice IS NULL OR r.rentPrice <= :maxPrice)
        AND (:option IS NULL OR r.options LIKE CONCAT('%', :option, '%'))
    """)

    /*

     */

    List<Room> searchRooms(
            @Param("district") String district,
            @Param("region") String region,
            @Param("type") String type,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("option") String option
    );

    // 지도 관련
    @Query(value = "SELECT * FROM room r WHERE " +
            "(6371 * acos(cos(radians(:userLat)) * cos(radians(r.latitude)) * " +
            "cos(radians(r.longitude) - radians(:userLng)) + sin(radians(:userLat)) * " +
            "sin(radians(r.latitude)))) <= :radiusKm", nativeQuery = true)
    List<Room> findRoomsNearLocation(
            @Param("userLat") Double userLat,
            @Param("userLng") Double userLng,
            @Param("radiusKm") Double radiusKm
    );

    // 지도 경계 기반 방 검색 (가격 필터 포함)
    @Query("SELECT r FROM Room r WHERE r.latitude BETWEEN :swLat AND :neLat " +
            "AND r.longitude BETWEEN :swLng AND :neLng " +
            "AND r.rentPrice BETWEEN :minPrice AND :maxPrice")
    List<Room> findRoomsInBoundary(
            @Param("swLat") Double swLat,
            @Param("swLng") Double swLng,
            @Param("neLat") Double neLat,
            @Param("neLng") Double neLng,
            @Param("minPrice") double minPrice,
            @Param("maxPrice") double maxPrice
    );

    List<Room> findByHostId(Long hostId);



}
