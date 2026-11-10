package com.corebank.api.dto;

import com.corebank.api.model.entity.Account;
import com.corebank.api.model.enums.AccountStatus;
import com.corebank.api.model.enums.AccountType;

import java.math.BigDecimal;
import java.util.UUID;

public record AccountResponseDTO(
        UUID id,
        String number,
        String branch,
        AccountType type,
        AccountStatus status,
        BigDecimal balance
) {
    public static AccountResponseDTO from(Account account) {
        return new AccountResponseDTO(
                account.getId(),
                account.getNumber(),
                account.getBranch(),
                account.getType(),
                account.getStatus(),
                account.getBalance()
        );
    }
}