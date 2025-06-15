package com.hszadkowski.iwa_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalendarSyncStatusDto {
    private boolean isSynced;
    private String calendarId;
    private String lastSyncTime;
    private boolean syncEnabled;
}
