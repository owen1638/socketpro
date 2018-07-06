#
# Generated Makefile - do not edit!
#
# Edit the Makefile in the project folder instead (../Makefile). Each target
# has a -pre and a -post target defined where you can add customized code.
#
# This makefile implements configuration specific macros and targets.


# Environment
MKDIR=mkdir
CP=cp
GREP=grep
NM=nm
CCADMIN=CCadmin
RANLIB=ranlib
CC=gcc
CCC=g++
CXX=g++
FC=gfortran
AS=as

# Macros
CND_PLATFORM=GNU-Linux-x86
CND_DLIB_EXT=so
CND_CONF=Debug
CND_DISTDIR=dist
CND_BUILDDIR=build

# Include project Makefile
include Makefile

# Object Directory
OBJECTDIR=${CND_BUILDDIR}/${CND_CONF}/${CND_PLATFORM}

# Object Files
OBJECTFILES= \
	${OBJECTDIR}/_ext/562988696/aclientw.o \
	${OBJECTDIR}/_ext/562988696/error_code.o \
	${OBJECTDIR}/_ext/562988696/membuffer.o \
	${OBJECTDIR}/cppperf.o


# C Compiler Flags
CFLAGS=-std=c++11 -Wall

# CC Compiler Flags
CCFLAGS=-std=c++11 -Wall
CXXFLAGS=-std=c++11 -Wall

# Fortran Compiler Flags
FFLAGS=

# Assembler Flags
ASFLAGS=

# Link Libraries and Options
LDLIBSOPTIONS=-ldl -lpthread

# Build Targets
.build-conf: ${BUILD_SUBPROJECTS}
	"${MAKE}"  -f nbproject/Makefile-${CND_CONF}.mk ${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}/cppperf

${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}/cppperf: ${OBJECTFILES}
	${MKDIR} -p ${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}
	g++ -o ${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}/cppperf ${OBJECTFILES} ${LDLIBSOPTIONS} -lstdc++

${OBJECTDIR}/_ext/562988696/aclientw.o: ../../../../include/aclientw.cpp 
	${MKDIR} -p ${OBJECTDIR}/_ext/562988696
	${RM} "$@.d"
	$(COMPILE.c) -g -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/562988696/aclientw.o ../../../../include/aclientw.cpp

${OBJECTDIR}/_ext/562988696/error_code.o: ../../../../include/error_code.cpp 
	${MKDIR} -p ${OBJECTDIR}/_ext/562988696
	${RM} "$@.d"
	$(COMPILE.c) -g -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/562988696/error_code.o ../../../../include/error_code.cpp

${OBJECTDIR}/_ext/562988696/membuffer.o: ../../../../include/membuffer.cpp 
	${MKDIR} -p ${OBJECTDIR}/_ext/562988696
	${RM} "$@.d"
	$(COMPILE.c) -g -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/562988696/membuffer.o ../../../../include/membuffer.cpp

${OBJECTDIR}/cppperf.o: cppperf.cpp 
	${MKDIR} -p ${OBJECTDIR}
	${RM} "$@.d"
	$(COMPILE.c) -g -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/cppperf.o cppperf.cpp

# Subprojects
.build-subprojects:

# Clean Targets
.clean-conf: ${CLEAN_SUBPROJECTS}
	${RM} -r ${CND_BUILDDIR}/${CND_CONF}
	${RM} ${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}/cppperf

# Subprojects
.clean-subprojects:

# Enable dependency checking
.dep.inc: .depcheck-impl

include .dep.inc
