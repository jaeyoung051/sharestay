package com.example.sharestay.dto;

import com.example.sharestay.entity.Host;
import com.example.sharestay.entity.Room;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomRequest {   // 방 등록, 수정 할 때 필요함
    private Long hostId;
    private String title;
    private double rentPrice;
    private int deposit;
    private String address;
    private String type;

    private int availabilityStatus;
    private String description;

    private String preferredGender;
    private String preferredAge;
    private Integer totalMembers;

    // 옵션: 0개 이상 선택 가능 → List<String> (nullable 허용)
    private List<String> options;
    // 생활 패턴: 0개 이상 선택 가능
    private List<String> lifestyle;

    // 편의 메서드 (null 방지용)
    public List<String> safeOptions() {
        return options == null ? List.of() : options;
    }
    public List<String> safeLifestyle() {
        return lifestyle == null ? List.of() : lifestyle;
    }

    /*
        클라이언트가 옵션 안 보냈으면 options == null
        빈 배열 보내면 options.isEmpty() == true
        둘 다 “옵션 없음” 으로 처리하면 됨.
     */


    private double latitude;
    private double longitude;

    public Room toEntity(Host host) {
        Room room = new Room(
                host,
                this.title,
                this.rentPrice,
                this.address,
                this.type,
                this.latitude,
                this.longitude,
                this.availabilityStatus,
                this.description,
                this.deposit
        );
        room.setOptionsFromList(safeOptions());
        room.setLifestyleFromList(safeLifestyle());
        room.setPreferredGender(this.preferredGender);
        room.setPreferredAge(this.preferredAge);
        room.setTotalMembers(this.totalMembers);
        return room;
    }
    //    private List<MultipartFile> images; // 여러 이미지 업로드 가능
    /*
        📌 이 필드는 프론트에서 FormData로 전송해야 합니다.
예: axios.post("/api/rooms", formData, { headers: { "Content-Type": "multipart/form-data" } })
     */

}
