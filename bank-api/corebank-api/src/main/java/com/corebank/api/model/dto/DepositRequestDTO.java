package com.corebank.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record DepositRequestDTO(

        @NotNull(message = "A conta de destino é obrigatória")
        UUID targetAccountId,

        @NotNull(message = "O valor é obrigatório")
        @DecimalMin(value = "0.01", message = "O valor deve ser de no mínimo 0,01")
        @Digits(integer = 17, fraction = 2, message = "Valor inválido (máximo de 2 casas decimais)")
        BigDecimal amount
) {}